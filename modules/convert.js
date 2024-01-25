import fetch from 'node-fetch'
import FormData from 'form-data';

export default function(app){
    app.get('/get-token', async (req, res) => {
        console.log('requested')
        const url = 'https://pdf-services.adobe.io/token';
      
        // Replace these values with your actual client_id and client_secret
        const client_id = 'b2d94025cf7d49b192d58b27a22cad5c';
        const client_secret = 'jhJyBzsfXDJxz6eemQEHmmcD1OVMVsif';
      
        const payload = `client_id=${encodeURIComponent(client_id)}&client_secret=${encodeURIComponent(client_secret)}`;
        const formData = new FormData();
        formData.append('client_id', client_id)
        formData.append('client_secret', client_secret)
      
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
          });
      
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
      
          const data = await response.json();
          res.json({ access_token: data.access_token });
          console.log(data.access_token)
          res.send(200)
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });
    //other routes..
}