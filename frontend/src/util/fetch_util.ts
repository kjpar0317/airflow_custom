import { encode } from "js-base64";

const CMP_TOKEN =
  "1113w213wiaW5mb3MiOnsiZW50TmFtZSI6IuuMgOq1rOq0keyeereW1lIjoi7KCV67O07ZmU67aA7IScIiwirrrr0LTk5OTkiLCJhY3Reeee23DEqZKvNI0a9XQzLXwKrJDJS73uT2fe-IfEWg";

// 이것 저것 해보자..
export async function getTabclouditFetch(url: string) {
  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${CMP_TOKEN}`,
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .catch((err) => console.log(err));
}

// 이것 저것 해보자..
export async function getTabclouditTextFetch(url: string) {
  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${CMP_TOKEN}`,
      "Content-Type": "application/text",
    },
  })
    .then((res) => res.text())
    .catch((err) => console.log(err));
}

// 이건 예제이다.
export async function fetchTabcloudit(
  url: string,
  method: string,
  { arg }: any = null
) {
  let request: RequestInit | undefined = {
    method: method,
    headers: {
      Authorization: `Bearer ${CMP_TOKEN}`,
      "Content-Type": "application/json",
    },
  };

  console.log(arg);

  if (arg) {
    request.body = JSON.stringify(arg);
  }

  return fetch(url, request)
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
