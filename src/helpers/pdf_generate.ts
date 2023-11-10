import fs from 'fs'
import { apiResponse } from '../common'
import { upload_all_type } from './S3'
import pdf from 'pdf-creator-node'
import config from 'config'
const certificate: any = config.get('certificate')
export const pdf_generation = async (body_data: any, upload_location: any, withPartner?: any) => {
    return new Promise(async function (resolve, reject) {
        try {
            let html = `<!DOCTYPE html>
                    <html lang="en">
                    
                    <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
                            integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
                        <title>certificate
                    
                        </title>
                        <style>
                            .input-1 {
                                position: absolute;
                                top: 44.4%;
                                right: 15%;
                                width: 70%;
                                border: none;
                                font-weight: bolder;
                                text-align: center;
                                display: flex;
                                justify-content: center;
                    
                            }
                    
                            .input-2 {
                                position: absolute;
                                top: 55%;
                                right: 0%;
                                left:0%;
                                width: 85%;
                                border: none;
                                font-weight: bolder;
                                text-align: center;
                                display: block;
                                justify-content: center;
                                margin-left:auto;
                                margin-right:auto;
                            }

                            .input-3 {
                                position: absolute;
                                top: 66%;
                                right: 0%;
                                left:0%;
                                width: 85%;
                                border: none;
                                font-weight: bolder;
                                text-align: center;
                                display: block;
                                justify-content: center;
                                margin-left:auto;
                                margin-right:auto;
                            }
                            .border-none{
                                border:none;
                            }
                    
                            input:focus {
                                outline: none;
                            }
                        </style>
                    </head>
                    
                    <body>
                        <div class="container">
                    
                    
                            <div class="contant position-relative d-flex justify-content-center">
                                <img src="${(withPartner ? certificate?.withPartner : certificate?.withoutPartner)}" class="img-fluid"
                                    style="height: 595px; width: 870px;">
                    
                                <div class="input-1">
                                    <input type="text" value="${body_data?.name}" class="w-100 text-center border-none">
                                </div>
                                <div class="input-2">
                                    <input type="text" value="${body_data?.subject_name}"
                                        class="w-100 text-center border-none">
                                </div>
                                <div class="input-3">
                                    <input type="text" value="${body_data?.date}" class="w-100 text-center border-none">
                                </div>
                            </div>
                        </div>
                    </body>
                    
                    </html>`
            const filename = 'Certificate_of_Completion.pdf'
            // const filename = body_data?.resultId + '.pdf'
            const document = {
                html: html,
                data: {
                    products: [body_data]
                },
                path: './' + filename

            }
            await pdf.create(document, {
                orientation: "landscape",
                format: "A4",
            })

            // await pdf.create(document, {
            //     formate: 'A4',
            //     orientation: 'portrait',
            //     // orientation: "landscape",
            //     border: '2mm',
            // })

            let location = await upload_all_type({
                data: fs.readFileSync(process.cwd() + `/${filename}`),
                name: filename,
                mimetype: 'application/pdf'
            }, upload_location)
            fs.unlinkSync(process.cwd() + `/${filename}`)
            return resolve(location)
        }
        catch (error) {
            reject(error)
        }
    })
}