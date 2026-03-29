async function analyze() {
  let file = document.getElementById("resume").files[0];
  let jd = document.getElementById("jd").value;

  if (!file || !jd) {
    alert("Upload resume + JD");
    return;
  }

  document.getElementById("score").innerText = "⏳";

  let formData = new FormData();
  formData.append("resume", file);
  formData.append("jd", jd);

  let res = await fetch("http://localhost:5000/analyze", {
    method: "POST",
    body: formData
  });

  let data = await res.json();

  document.getElementById("score").innerText =
    (data.score || 0) + "%";

  document.getElementById("missing").innerText =
    data.missing?.join(", ") || "No missing skills";

  document.getElementById("feedback").innerText =
    data.feedback || "No feedback";
}