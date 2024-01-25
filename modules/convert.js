import fetch from 'node-fetch'
import { exec } from 'child_process'
import fs from 'fs';
import * as curlconverter from 'curlconverter';
import FormData from 'form-data';

export default function(app){
    app.get('/get-token', async (req, res) => {
        console.log('requested')
        const url = 'https://pdf-services.adobe.io/token';
      
        // Replace these values with your actual client_id and client_secret
        const client_id = 'b2d94025cf7d49b192d58b27a22cad5c';
        const client_secret = 'p8e-jhJyBzsfXDJxz6eemQEHmmcD1OVMVsif';
      
        const payload = `client_id=${encodeURIComponent(client_id)}&client_secret=${encodeURIComponent(client_secret)}`;
        // const formData = new FormData();
        // formData.append('client_id', client_id)
        // formData.append('client_secret', client_secret)
      
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: payload,
            });
        
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        
            const data = await response.json();
            console.log(data.access_token)
            


            const assetUrl = 'https://pdf-services.adobe.io/assets';
                
            const requestData = {
                mediaType: "application/pdf"
            };

        
            const responseAsset = await fetch(assetUrl, {
                method: 'POST',
                headers: {
                    'X-API-Key': client_id,
                    'Authorization': `Bearer ${data.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData),
            });

            // if (!responseAsset.ok) {
            //     throw new Error(`HTTP error! Status: ${responseAsset.status}`);
            // }

            const dataAsset = await responseAsset.json();

            const endurl = `https://pdf-services.adobe.io/operation/pdftoimages`;

            const convertPDF = async() => {
                let res = await fetch(`${endurl}`, {
                    method: 'POST',
                    headers: {  
                        'x-api-key': client_id,
                        "Authorization" : `Bearer ${data.access_token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        assetID: 'urn:aaid:AS:UE1:bff4aa08-ae58-49c0-b1a0-12aa152d1ad0',
                        targetFormat: "jpeg",
                        outputType: "listOfPageImages"
                        })
                })
                
                let json = res.headers
                return res
            }

             const test = await convertPDF()
            res.json({ token: data.access_token , uploadUri: dataAsset.uploadUri,  assetID: dataAsset.assetID, headers: test.headers.get('location') });
        } catch (error) {
        res.status(500).json({ error: error.message });
        }

      });

      app.get('/uploadFile', async (req, res) => {
        // const curlCommand = `
        // curl --location -g --request PUT 'https://dcplatformstorageservice-prod-us-east-1.s3-accelerate.amazonaws.com/b2d94025cf7d49b192d58b27a22cad5c_9A87147D65A5BE4C0A495E25%40techacct.adobe.com/8f8d01a0-db97-402c-92c7-db37665af478?X-Amz-Security-Token=FwoGZXIvYXdzEOT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDNZjhQ38KzXdKJNYxCLTAXECPTkEoySyltFz%2FPvTwRWwu%2FVZOmkPioAuInA%2Bi1Q0hZyqRX5KWWKMm5UtBcph5Fgwe4h%2FZ%2BigFoUc0EPT1yXXu8%2FiemrdOv4kd92owsqyLvq9p1txD%2FjwHnTZAt1ZlZBL1Ti5f7fRXNTjK%2BnSRsru1DT3DRzq2ubjsQGrTGNBQM9hPVn1iD7hskpRMX%2FRE4TM%2BTrUz6QpZHD9LzFp9%2Bkj1%2FJqg9IRUqKnwBpAdpITOjW945Gj13LUR5UYQKnmrpS5v4RE2s5UrIzLUcdWZgl4zdgog%2BjIrQYyLb9Of%2FZcX08rdQcZ49FcZsCgaO2HohijeY4W3fVmZMhw%2B3TjRbeR8i5IaLmYag%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240125T101853Z&X-Amz-SignedHeaders=content-type%3Bhost&X-Amz-Expires=3600&X-Amz-Credential=ASIAWD2N7EVPNWYLIW62%2F20240125%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=c6294499fc7e13e2109485498f5e53fdf1a8c463ec07ed1d1b96d46c078900a3' \
        // --header 'Content-Type: application/pdf' \
        // --data-binary '@https://drive.google.com/file/d/1dv2q0kZXR_-KLCWJA4kmc6W-701fm4vi/view?usp=sharing'`

        //     const fetchCode = curlconverter.toJavaScript(curlCommand);
        //     console.log(fetchCode);

        // exec(`
        // curl --location -g --request PUT 'https://dcplatformstorageservice-prod-us-east-1.s3-accelerate.amazonaws.com/b2d94025cf7d49b192d58b27a22cad5c_9A87147D65A5BE4C0A495E25%40techacct.adobe.com/af706d36-3791-4ff0-b25d-2fa4c8a18a6a?X-Amz-Security-Token=FwoGZXIvYXdzEOX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDND1%2BvMrYdRN1ulzuiLUAfugMon%2BLBpIqV1O9DlmxNjp5lrKp9tRna4Veyly03u9B0u31keDHBnTKksaFq5wJahYGnYGwXaTqkuDcG1dCjQ0Jx7vJic3gN0V4lBR83yKpyM%2Bu6bpVGsKdBNdOHnryGQFqjJWPQwzpOrBnzKnRmwdsVHE9WM%2F0kNshPsCu7vvQzp6FicgEi246KN8rVQEqkomm4Kc0wA7pgxN6AXN%2FFHMTIvtynxi51nacVLFRoDNTEBo1WE0NWFHUoOljpU0T23drtxi%2BXmsaYkX7Tw8o6nev5vCKNeCya0GMi2USeFYYBE9S19xjutfCO%2BiQka1009muPGcZ99JzrUHQISbLeWFeUeL6wxCNf4%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240125T111154Z&X-Amz-SignedHeaders=content-type%3Bhost&X-Amz-Expires=3599&X-Amz-Credential=ASIAWD2N7EVPKCZLQL46%2F20240125%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=e682354bb04ed6358ad35b9b882036e27fae29b2efdee9f3f03830e159c626f4' \
        // --header 'Content-Type: application/pdf' \
        // --data-binary 'https://drive.google.com/file/d/1fmC041M7RE--1HweHdDRZOXZ9dosM-SA/view?usp=sharing'`, (error, stdout, stderr) => {
        //     if (error) {
        //       console.error(`Error: ${error}`);
        //       return;
        //     }
        //     if (stderr) {
        //       console.error(`stderr: ${stderr}`);
        //       return;
        //     }
        //     res.json(stdout)
        //     console.log(`stdout: ${stdout}`);
        //   });

        const fileUrl = 'https://drive.google.com/file/d/1fmC041M7RE--1HweHdDRZOXZ9dosM-SA/view?usp=sharing';
        // const stream = fs.createReadStream(fileUrl);
        // stream.pipe().on('data', (d) => {
        //     console.log('data: ', d)
        // })
        const response = await fetch('https://drive.google.com/file/d/1fmC041M7RE--1HweHdDRZOXZ9dosM-SA/view?usp=sharing');
        const blob = await response.blob();
        console.log(blob.size);

        const upl = await fetch('https://dcplatformstorageservice-prod-us-east-1.s3-accelerate.amazonaws.com/b2d94025cf7d49b192d58b27a22cad5c_9A87147D65A5BE4C0A495E25%40techacct.adobe.com/99c5144d-a637-4bd5-944a-23dcb9381f23?X-Amz-Security-Token=FwoGZXIvYXdzEOb%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDLkqfYrHGPZQPSKhzSLTAa9YXej%2B2BGx0saVQuqK3gDQVre8RJ0yBpp5K5Q8CVG4R7tFU7ENGu3I%2B9%2FPxIxxCf9RYbdgELG1fgThluemLlRqTKwPGb2PbRDszqMQzvEY7WMw3fm8CpicOYusbmLlGD8T9tER6abo8GyY9xii%2B5doH2cpZuAxunGgvHEdNT8FIaxLoMNU8tzTbdH7GDj502E0sgJwK%2F%2BdwbJJOYO4c8sWOUjumS%2FP%2BLtwAjMMuCUcPbqnxZ1mYwCY5rWSNVknytMkTJP47WRXGbXJNVbFIf%2Fz1U0o66bJrQYyLYo5rT%2BIwmq1lbfKQZftg0JCQcbgwJLfTqiTecSVv4NEAUOpPxIH5oMMRTReog%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240125T123356Z&X-Amz-SignedHeaders=content-type%3Bhost&X-Amz-Expires=3600&X-Amz-Credential=ASIAWD2N7EVPHCSN6X6W%2F20240125%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=6809a85e7e4d4dcaefa95abf91f0e8d123145e3351b4285dad76eabe54a466af', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/pdf',
                // 'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsIng1dSI6Imltc19uYTEta2V5LWF0LTEuY2VyIiwia2lkIjoiaW1zX25hMS1rZXktYXQtMSIsIml0dCI6ImF0In0.eyJpZCI6IjE3MDYxODM3NzY4NDBfYWY0ZDU2MmMtMmIwNi00NTI5LTg5OWItNTVhNmNlY2IyYTFlX3VlMSIsIm9yZyI6Ijk0QUYxMzQ4NjVBNUJEQzMwQTQ5NUM2MEBBZG9iZU9yZyIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJjbGllbnRfaWQiOiJiMmQ5NDAyNWNmN2Q0OWIxOTJkNThiMjdhMjJjYWQ1YyIsInVzZXJfaWQiOiI5QTg3MTQ3RDY1QTVCRTRDMEE0OTVFMjVAdGVjaGFjY3QuYWRvYmUuY29tIiwiYXMiOiJpbXMtbmExIiwiYWFfaWQiOiI5QTg3MTQ3RDY1QTVCRTRDMEE0OTVFMjVAdGVjaGFjY3QuYWRvYmUuY29tIiwiY3RwIjozLCJtb2kiOiJkOGZlMThhZSIsImV4cGlyZXNfaW4iOiI4NjQwMDAwMCIsImNyZWF0ZWRfYXQiOiIxNzA2MTgzNzc2ODQwIiwic2NvcGUiOiJEQ0FQSSxvcGVuaWQsQWRvYmVJRCJ9.dMkJssISL8owX_fPyBglsroMIHYJ88o8H0Z51fh01K3B6ysaqxcNMX0ga4buEJMif2Oz5Mi1zyMOMhx4pVBBsPFz3BNkZywscu8o77A2TJpbFCauJ5mptR4UMNOX93kA0FhuAlIlogbXDeAgHNWCbmCeRPgw2BpD2ODHrUU8sxfiwdHNuP1Y31RSEa8fvGOs4zmBJtHg_Ohv1Ywk0RCbOU8j6ikWZvnqz6W-Mk1pyJuFA_WsJ4M-wQKDu36Ixpgqaqzzz2ckbq-M-30RNG4kBC3EBNLtvIgzsEizuNBhXm8sPqU4zvLvBKg2JRielbh5wNPOWmr0Cx5EbCjY9p8Fvg'
            },
            body: blob
        });
        console.log(upl.size);
        res.json(await upl.text())

        // const method = curlCommand.match(/-X (\w+)/)[1];
        // const url = curlCommand.match(/(http[s]?:\/\/[^\s]+)/)[1];
        // const filePath = curlCommand.match(/@(\S+)/)[1];

        // // Node.js example using 'node-fetch' module
        // const fetch = require('node-fetch');
        // const fs = require('fs');

        // // Read binary data from the file
        // const fileData = fs.readFileSync(filePath);

        // // Create FormData object and append the binary data
        // const formData = new FormData();
        // formData.append('file', fileData, { filename: 'file.bin' });

        // // Make the fetch request
        // fetch(url, {
        // method: method,
        // body: formData,
        // headers: {
        //     'Content-Type': 'multipart/form-data',
        // },
        // })
        // .then(response => response.json())
        // .then(data => console.log(data))
        // .catch(error => console.error('Error:', error));

//         const url = 'https://dcplatformstorageservice-prod-us-east-1.s3-accelerate.amazonaws.com/b2d94025cf7d49b192d58b27a22cad5c_9A87147D65A5BE4C0A495E25%40techacct.adobe.com/8f8d01a0-db97-402c-92c7-db37665af478?X-Amz-Security-Token=FwoGZXIvYXdzEOT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDNZjhQ38KzXdKJNYxCLTAXECPTkEoySyltFz%2FPvTwRWwu%2FVZOmkPioAuInA%2Bi1Q0hZyqRX5KWWKMm5UtBcph5Fgwe4h%2FZ%2BigFoUc0EPT1yXXu8%2FiemrdOv4kd92owsqyLvq9p1txD%2FjwHnTZAt1ZlZBL1Ti5f7fRXNTjK%2BnSRsru1DT3DRzq2ubjsQGrTGNBQM9hPVn1iD7hskpRMX%2FRE4TM%2BTrUz6QpZHD9LzFp9%2Bkj1%2FJqg9IRUqKnwBpAdpITOjW945Gj13LUR5UYQKnmrpS5v4RE2s5UrIzLUcdWZgl4zdgog%2BjIrQYyLb9Of%2FZcX08rdQcZ49FcZsCgaO2HohijeY4W3fVmZMhw%2B3TjRbeR8i5IaLmYag%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240125T101853Z&X-Amz-SignedHeaders=content-type%3Bhost&X-Amz-Expires=3600&X-Amz-Credential=ASIAWD2N7EVPNWYLIW62%2F20240125%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=c6294499fc7e13e2109485498f5e53fdf1a8c463ec07ed1d1b96d46c078900a3';
// const contentType = 'application/pdf';
// const filePath = 'https://drive.google.com/file/d/1dv2q0kZXR_-KLCWJA4kmc6W-701fm4vi/view?usp=sharing';

// // Read binary data from the file
// const fileData = fs.readFileSync(filePath);

// // Make the fetch request
// fetch(url, {
//   method: 'PUT',
//   body: fileData,
//   headers: {
//     'Content-Type': contentType,
//   },
// })
//   .then(response => response.json())
//   .then(data => console.log(data))
//   .catch(error => console.error('Error:', error));


      });
    //other routes..
}