async function analyze() {
  let file = document.getElementById("resume").files[0];
  let jd = document.getElementById("jd").value;

  if (!file || !jd) {
    alert("Upload resume and enter job description");
    return;
  }

  let formData = new FormData();
  formData.append("resume", file);
  formData.append("jd", jd);

  let res = await fetch("http://localhost:5000/analyze", {
    method: "POST",
    body: formData
  });

  let data = await res.json();

  document.getElementById("found").innerHTML =
  data.found && data.found.length
    ? data.found.map(s => `<li>${s}</li>`).join("")
    : "<li>No matching skills found</li>";

document.getElementById("missing").innerHTML =
  data.missing && data.missing.length
    ? data.missing.map(s => `<li>${s}</li>`).join("")
    : "<li>No missing skills 🎉</li>";

document.getElementById("feedback").innerText =
  data.feedback || "No feedback available";
}