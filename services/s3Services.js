const AWS = require('aws-sdk');

const uploadToS3 = (data, filename) => {
    console.log("got into this")
    console.log(data)
    const BUCKET_NAME = process.env.BUCKET_NAME
    const IAM_USER_KEY = process.env.IAM_USER_KEY
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET

    let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
        Bucket: BUCKET_NAME
    })
    console.log("created")
    console.log(s3bucket)
    var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data.buffer,
        ACL: 'public-read',
        // ContentType: 'image/png'
        ContentType: data.mimetype
    }
    console.log("done")
    console.log(params)
    return new Promise((resolve, reject) => {
        s3bucket.upload(params, (err, s3response) => {
            console.log("uploaded")
            console.log(s3response)
            if (err) {
                console.log("error occured")
                reject(err)
            }
            else {
                resolve(s3response.Location);
            }
        })
    })

}

module.exports = { uploadToS3 }