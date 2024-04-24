import { encode } from "base-64";

// 이것 저것 해보자..
export async function getTabclouditFetch(url: string) {
  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer erera22222.eyJpc3MiOiJjbXAtc2VydmljZS1hdXRoIiwic3ViIjoic3VwZXJhZG1pbiIsImF1ZCI6ImNtcC1jbGllbnQtZnJvbnRlbmQiLCJleHAiOjE3MzkzMzc3NTUsImlhdCI6MTcwNzgwMTc1Ner33V67O07ZmU67aA7IScIiwiaXAiOiIxMjcuMC4wLjEiLCJfasdfdsfa23UiOiJsb2NhbCIsImFkbWluIjp0cnVlLCJpc1NTT0xvZ2luIjpmYWxzZSwibG9naW5Vc2VyTmFtZSI6Iuq0gOumrOyekCIsImlzT1NNYW5hZ2VyIjp0cnVlLCJsb2dpblRpbWUiOjE3MDc4MDE2ODMwMDAsImVudENvZGUiOiJEQUUiLCJ1bml0QasdfasdfsdfsdfSIsInVzZXJuYW1lIjoic3VwZXJhZG1pbiJ9fQ.pS2QIGU8roPtXHjGEeIr4z_Irdsf3333uT2fe-IfEWg`,
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
