;(function(window, document){
  document.addEventListener('DOMContentLoaded', function(){
    // 1) Find the placeholder
    const container = document.getElementById('mp-finder-widget');
    if (!container) return;

    // 2) Inject HTML + scoped CSS
    container.innerHTML = `
      <style>
        #mp-finder-widget { font-family: 'Segoe UI', sans-serif; max-width: 400px; margin: auto; }
        #mp-finder-widget input,
        #mp-finder-widget button {
          width: 100%; padding: 0.8rem; margin-bottom: 1rem; font-size: 1rem; border-radius: 8px; border: 1px solid #ccc;
        }
        #mp-finder-widget button {
          background-color: #0077cc; color: white; cursor: pointer; border: none;
        }
        #mp-finder-widget button:hover { background-color: #005fa3; }
        #mp-finder-widget .spinner {
          border: 4px solid #f3f3f3; border-top: 4px solid #333;
          border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite;
          margin: 20px auto;
        }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        #mp-finder-widget .result { margin-top: 1.5rem; text-align: left; }
        #mp-finder-widget a { color: #0077cc; text-decoration: none; font-weight: bold; }
        #mp-finder-widget a:hover { text-decoration: underline; }
        #mp-finder-widget .small { font-size: 0.85rem; color: #555; margin-top: 1rem; }
      </style>

      <div class="container">
        <h1>Find Your MP</h1>
        <input type="text" id="mp-postcode" placeholder="Enter your postcode" />
        <button id="mp-find-btn">Find My MP</button>
        <div id="mp-result" class="result"></div>
      </div>
    `;

    // 3) The lookup function
    async function findMP() {
      const postcode = container.querySelector('#mp-postcode').value.trim();
      const resultDiv = container.querySelector('#mp-result');
      if (!postcode) {
        resultDiv.innerHTML = '<p>Please enter a postcode.</p>';
        return;
      }
      resultDiv.innerHTML = '<div class="spinner"></div><p>Looking up your MP…</p>';

      try {
        // 3a) MapIt Netlify function
        const mapitResp = await fetch(`/.netlify/functions/mapit?postcode=${encodeURIComponent(postcode)}`);
        const mapitData = await mapitResp.json();
        if (!mapitData.areas) {
          resultDiv.innerHTML = '<p>Invalid postcode. Please try again.</p>';
          return;
        }
        const wmc = Object.values(mapitData.areas).find(a => a.type === 'WMC');
        if (!wmc) {
          resultDiv.innerHTML = '<p>No constituency found for this postcode.</p>';
          return;
        }

        // 3b) Parliament API
        const mpResp = await fetch(
          `https://members.parliament.uk/api/Members/Search?Constituency=${encodeURIComponent(wmc.name)}&House=Commons`
        );
        const mpData = await mpResp.json();
        if (!mpData.items || mpData.items.length === 0) {
          resultDiv.innerHTML = '<p>No MP found for your constituency.</p>';
          return;
        }
        const mp = mpData.items[0].value;
        const name = mp.nameDisplayAs;
        const party = mp.latestParty.name;
        const email = mp.email || '';

        // 3c) Build the mailto link
const subject = encodeURIComponent('Concern from a constituent');
const body = encodeURIComponent(`Dear ${mp.name},

I am writing to you regarding the ASLEF train driver’s union ‘Rail Freight Future’ campaign and the need for investment in the UK’s rail freight industry.
I am a member of ASLEF and a train driver, and I know how important the railways are for our country.
Rail freight is a key contributor to the UK economy and helps to protect the climate, while also increasing road safety and creating jobs.
We need rail freight to build homes and infrastructure and to deliver the goods, medicine and food that people need.
A lack of investment in rail infrastructure alongside rising costs for rail usage have seen rail freight at a disadvantage over the last decade, causing decline and a race to the bottom within the sector. This must change.

As my MP I am asking that you:
- Read the report put together by ASLEF at [insert link here]
- Call for investment in the railways and speak up for rail freight in Parliament and your constituency
- Join the campaign to reinstate HS2 to increase capacity for rail freight resulting in better passenger services
- Raise the needs of rail freight in the process for Great British Railways calling for fair access, expansion and a strategy to grow freight

Thank you for taking the time to read my email.

Yours sincerely,

[Your Name]

${postcode}`);

+ const body = encodeURIComponent(`
+ Dear ${mp.name},
+
+ I am writing to you regarding the ASLEF train driver’s union ‘Rail Freight Future’ campaign and the need for investment in the UK’s rail freight industry.
+ I am a member of ASLEF and a train driver, and I know how important the railways are for our country.
+ Rail freight is a key contributor to the UK economy and helps to protect the climate, while also increasing road safety and creating jobs.
+ We need rail freight to build homes and infrastructure and to deliver the goods, medicine and food that people need.
+ A lack of investment in rail infrastructure alongside rising costs for rail usage have seen rail freight at a disadvantage over the last decade, causing decline and a race to the bottom within the sector. This must change.
+
+ As my MP I am asking that you:
+ - Read the report put together by ASLEF at [insert link here]
+ - Call for investment in the railways and speak up for rail freight in Parliament and your constituency
+ - Join the campaign to reinstate HS2 to increase capacity for rail freight resulting in better passenger services
+ - Raise the needs of rail freight in the process for Great British Railways calling for fair access, expansion and a strategy to grow freight
+
+ Thank you for taking the time to read my email.
+
+ Yours sincerely,
+
+ [Your Name]
+
+ ${postcode}
+ `);

        );

        resultDiv.innerHTML = `
          <p><strong>Your MP:</strong><br>${name} (${party})</p>
          <a href="mailto:${email}?subject=${subject}&body=${body}">
            Click here to email ${name}
          </a>
          <p class="small">Please personalize your message before sending.</p>
        `;
      } catch (err) {
        console.error(err);
        resultDiv.innerHTML = '<p>An error occurred. Please try again later.</p>';
      }
    }

    // 4) Wire up the button
    container.querySelector('#mp-find-btn').addEventListener('click', findMP);
  });
})(window, document);
