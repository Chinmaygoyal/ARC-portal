process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const axios = require("axios");
const fs = require("fs");
const data = require("../config/student.json");

async function updateStudentData() {
  const { data } = await axios.get("https://search.pclub.in/api/students");
  fs.writeFileSync("../config/student.json", JSON.stringify(data), {
    flag: "w"
  });
}

function getData(email) {
  const username = email.split("@")[0];
  const studentData = data.find(student => student.u === username);
  return studentData;
}

exports.getData = getData;
