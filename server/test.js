// using global fetch
fetch('https://ce.judge0.com/submissions/?base64_encoded=false&wait=true', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ source_code: "print('hello')", language_id: 71 })
}).then(r => r.json()).then(data => {
  console.log(data);
}).catch(console.error);
