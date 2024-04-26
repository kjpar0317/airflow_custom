# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
"""
   webserver_config
   Referencies
     - https://flask-appbuilder.readthedocs.io/en/latest/security.html#authentication-oauth
"""

import os
import logging
import jwt
import requests
import json

from dotenv import load_dotenv
from base64 import b64decode
from cryptography.hazmat.primitives import serialization

from flask import redirect, session
from flask_appbuilder import expose
from flask_appbuilder.security.manager import AUTH_OAUTH
from flask_appbuilder.security.views import AuthOAuthView

from airflow.www.security import AirflowSecurityManager
from airflow.models import Variable

load_dotenv()

basedir = os.path.abspath(os.path.dirname(__file__))
log = logging.getLogger(__name__)

MY_PROVIDER = 'keycloak'
# CLIENT_ID = 'airflow'
# CLIENT_SECRET = 'z6cxuk9cElW4HPV7Cl8I5nUHYio1NcBN'
# KEYCLOAK_ISSUER_URL = 'http://192.168.130.205:7001/realms/airflow'
# KEYCLOAK_BASE_URL = 'http://192.168.130.205:7001/realms/airflow/protocol/openid-connect/'
# KEYCLOAK_TOKEN_URL = 'http://192.168.130.205:7001/realms/airflow/protocol/openid-connect/token'
# KEYCLOAK_AUTH_URL = 'http://192.168.130.205:7001/realms/airflow/protocol/openid-connect/auth'
# KEYCLOAK_JWKS_URL = 'http://192.168.130.205:7001/realms/airflow/protocol/openid-connect/certs'

AUTH_TYPE = AUTH_OAUTH
AUTH_USER_REGISTRATION = True
AUTH_USER_REGISTRATION_ROLE = "Public"
AUTH_ROLES_SYNC_AT_LOGIN = True
PERMANENT_SESSION_LIFETIME = 1800

AUTH_ROLES_MAPPING = {
  "airflow_admin": ["Admin"],
  "airflow_op": ["Op"],
  "airflow_user": ["User"],
  "airflow_viewer": ["Viewer"],
  "airflow_public": ["Public"],
}

OAUTH_PROVIDERS = [
  {
   'name': 'keycloak',
   'icon': 'fa-circle-o',
   'token_key': 'access_token', 
   'remote_app': {
     'client_id': os.getenv("KEYCLOAK_CLIENT_ID"),
     'client_secret': os.getenv("KEYCLOAK_CLIENT_SECRET"),
     'client_kwargs': {
       'scope': 'email profile'
     },
     'api_base_url': os.getenv("KEYCLOAK_BASE_URL"),
     'request_token_url': None,
     'access_token_url': os.getenv("KEYCLOAK_TOKEN_URL"),
     'authorize_url': os.getenv("KEYCLOAK_AUTH_URL"),
     'jwks_uri': os.getenv("KEYCLOAK_JWKS_URL"),
    },
  },
]

Variable.set("oauth_list", json.dumps(OAUTH_PROVIDERS, indent=2))
Variable.set("keycloak_cron_expression", os.getenv("KEYCLOAK_TOKEN_CRON"))

req = requests.get(os.getenv("KEYCLOAK_ISSUER_URL"))
key_der_base64_json = req.json()
key_der_base64 = key_der_base64_json['public_key']
key_der = b64decode(key_der_base64.encode())
public_key = serialization.load_der_public_key(key_der)

class CustomAuthRemoteUserView(AuthOAuthView):
  @expose("/logout/")
  def logout(self):
    """Delete access token before logging out."""
    return super().logout()

class CustomSecurityManager(AirflowSecurityManager):
  authoauthview = CustomAuthRemoteUserView

  def oauth_user_info(self, provider, response):
    if provider == MY_PROVIDER:
      token = response["access_token"]

      # 미리 넣어둔다
      Variable.set("keycloak_access_info", token) 
      Variable.set("keycloak_public_key", f"-----BEGIN PUBLIC KEY-----\n{key_der_base64}\n-----END PUBLIC KEY-----")
      # Variable.set("keycloak_public_key_encode", public_key)

      log.info(key_der_base64)

      me = jwt.decode(token, public_key, algorithms=['RS256'], audience="account")

      log.info(me)
      
      # sample of resource_access
      # {
      #   "resource_access": { "airflow": { "roles": ["airflow_admin"] }}
      # }
      # groups = me["resource_access"]["account"]["roles"] # unsafe

      # log.info("groups: {0}".format(groups))

      # if len(groups) < 1:
      #   groups = ["airflow_public"]
      # else:
      #   groups = [str for str in groups if "airflow" in str]

      userinfo = {
        "username": me.get("preferred_username"),
        "email": me.get("email"),
        "first_name": me.get("given_name"),
        "last_name": me.get("family_name"),
        "role_keys": AUTH_ROLES_MAPPING.get(me.get("preferred_username")),
      }
      log.info("user info: {0}".format(userinfo))
      return userinfo
    else:
       return {}


  def auth_user_oauth(self, userinfo):
    """
        Method for authenticating user with OAuth.
        :userinfo: dict with user information
                    (keys are the same as User model columns)
    """
    # extract the username from `userinfo`
    if "username" in userinfo:
      username = userinfo["username"]
    elif "email" in userinfo:
      username = userinfo["email"]
    else:
      log.error(
          "OAUTH userinfo does not have username or email {0}".format(userinfo)
      )
      return None

    # If username is empty, go away
    if (username is None) or username == "":
      return None
    
    # Search the DB for this user
    user = self.find_user(username=username)

    # If user is not active, go away
    if user and (not user.is_active):
      return None

    # If user is not registered, and not self-registration, go away
    if (not user) and (not self.auth_user_registration):
      return None

    # Sync the user's roles
    if user and self.auth_roles_sync_at_login:
      user_role_objects = set()
      user_role_objects.add(self.find_role(AUTH_USER_REGISTRATION_ROLE))
      
      for item in userinfo.get("role_keys", []):
        fab_role = self.find_role(item)
        if fab_role:
          user_role_objects.add(fab_role)
        user.roles = list(user_role_objects)

      log.debug(
          "Calculated new roles for user='{0}' as: {1}".format(
              username, user.roles
          )
      )

    # If the user is new, register them
    if (not user) and self.auth_user_registration:
      user_role_objects = set()
      user_role_objects.add(self.find_role(AUTH_USER_REGISTRATION_ROLE))

      for item in userinfo.get("role_keys", []):
        fab_role = self.find_role(item)
        if fab_role:
          user_role_objects.add(fab_role)
      
      user = self.add_user(
        username=username,
        first_name=userinfo.get("first_name", ""),
        last_name=userinfo.get("last_name", ""),
        email=userinfo.get("email", "") or f"{username}@email.notfound",
        role=list(user_role_objects),
      )
      log.debug("New user registered: {0}".format(user))

      # If user registration failed, go away
      if not user:
        log.error("Error creating a new OAuth user {0}".format(username))
        return None

    # LOGIN SUCCESS (only if user is now registered)
    if user:
      self.update_user_auth_stat(user)
      return user
    else:
      return None

SECURITY_MANAGER_CLASS = CustomSecurityManager

APP_THEME = "simplex.css"