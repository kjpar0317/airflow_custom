import { encode } from "base-64";

// 이것 저것 해보자..
export async function getTabclouditFetch(url: string) {
  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJjbXAtc2VydmljZS1hdXRoIiwic3ViIjoic3VwZXJhZG1pbiIsImF1ZCI6ImNtcC1jbGllbnQtZnJvbnRlbmQiLCJleHAiOjE3MzkzMzc3NTUsImlhdCI6MTcwNzgwMTc1NSwiaW5mb3MiOnsiZW50TmFtZSI6IuuMgOq1rOq0keyXreyLnCIsInVuaXROYW1lIjoi7KCV67O07ZmU67aA7IScIiwiaXAiOiIxMjcuMC4wLjEiLCJjb250cmFjdCI6IjAxMC0xMjM0LTk5OTkiLCJhY3RpdmUiOiJsb2NhbCIsImFkbWluIjp0cnVlLCJpc1NTT0xvZ2luIjpmYWxzZSwibG9naW5Vc2VyTmFtZSI6Iuq0gOumrOyekCIsImlzT1NNYW5hZ2VyIjp0cnVlLCJsb2dpblRpbWUiOjE3MDc4MDE2ODMwMDAsImVudENvZGUiOiJEQUUiLCJ1bml0Q29kZSI6IjAwMiIsImVtYWlsIjoiYWJjQGlubm9ncmlkLmNvbSIsInVzZXJuYW1lIjoic3VwZXJhZG1pbiJ9fQ.pS2QIGU8roPtXHjGEeIr4z_Ir6euVqMYNz6OBJ8TsjViqzR406DEqZKvNI0a9XQzLXwKrJDJS73uT2fe-IfEWg`,
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .catch((err) => console.log(err));
}

// 억지로 추가
export async function getAirflowFetch(url: string) {
  return fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: `Basic ${encode("airflow:airflow")}`,
    },
  })
    .then((res) => res.json())
    .catch((err) => console.log(err));
}