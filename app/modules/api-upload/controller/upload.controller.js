'use strict';

const Boom = require('boom');
const Joi = require('joi');
const fs = require('fs');
const path = require('path');
const JWT = require('jsonwebtoken');
const mkdirp = require('mkdirp');
const requestF = require('request');
// const easyimg = require('easyimage');
// const probe = require('probe-image-size');
const rimraf = require('rimraf');
const cloudinary = require('cloudinary');

//get file extension
var getFileExt = function(fileName) {
    var fileExt = fileName.split(".");
    if (fileExt.length === 1 || (fileExt[0] === "" && fileExt.length === 2)) {
        return "";
    }
    return fileExt.pop();
};
//get file upload name - without extension
var getFileName = function(fileName) {
    return fileName.substring(0, fileName.lastIndexOf('.'));
};

var fileValidate = function(fileName, allowExts, cb) {
    var allowExts = allowExts.split(',');
    allowExts = allowExts.map(function(item) {
        return item.trim();
    });
    var fileExt = getFileExt(fileName).toLowerCase();
    if (allowExts.indexOf(fileExt) > -1) {
        cb(null, true);
    }
    cb(null, false);
};

var storage = function(request, cb) {
    var data = request.payload;
    var name = data.file.hapi.filename;
    var old_name = data.old_filename;
    var uploadPath = path.join(configManager.get('web.upload.path'), name);
    if (data.type) {
        mkdirp(path.join(configManager.get('web.upload.path'), data.type), function(err) {
            if (data.filename) {
                name = data.filename + '.' + getFileExt(name);;
            } else {
                name = getFileName(name) + '-' + Date.now() + '.' + getFileExt(name);
            }
            uploadPath = path.join(configManager.get('web.upload.path'), data.type, name);
            if (old_name) {
                var old_path = path.join(configManager.get('web.upload.path'), data.type, old_name);
                fs.unlink(old_path, function(err) {
                    if (err) {
                        console.log("Err: ", err);
                    }
                })
            }
            var exist = fs.access(uploadPath, fs.constants.R_OK, (err) => {
                if (!err) {
                    uploadPath = path.join(configManager.get('web.upload.path'), data.type, name);
                }
                cb(name, uploadPath);
            });
        });
    } else {
        var exist = fs.access(uploadPath, fs.constants.R_OK, (err) => {
            if (!err) {
                if (data.filename) {
                    name = data.filename;
                } else {
                    name = getFileName(name) + '-' + Date.now() + '.' + getFileExt(name);
                }
                uploadPath = path.join(configManager.get('web.upload.path'), name);
            }
            cb(name, uploadPath);
        });
    }
}

exports.index = {
    auth: false,
    handler: function(request, reply) {
        return reply({
            status: true,
            msg: 'It works'
        });
    },
    description: 'Service status',
    tags: ['api']
}

exports.removeFolder = {
    // auth: true,
    handler: function(request, reply) {
        let { removeFolder } = request.server.plugins['api-upload'];
        removeFolder(request.path_in_files, function() {
            return reply({ status: true });
        })
    }
}

exports.uploadImage = {
    auth: false,
    handler: function(request, reply) {
        var configManager = request.server.configManager;
        var data = request.payload;
        storage(request, function(filename, uploadPath) {
            var file = fs.createWriteStream(uploadPath);
            file.on('error', function(err) {
                request.log(['error', 'upload'], err);
                request.log(['error'], err);
                reply({
                    status: 0,
                    file: {}
                })
            });
            data.file.pipe(file);
            data.file.on('end', function(err) {
                if (err) {
                    request.log(['error', 'upload'], err);
                    return reply(err);
                }
                var fileInfo = {
                    filename: filename
                }
                reply({
                    status: 1,
                    file: fileInfo
                })
            });
        });
    },
    validate: {
        payload: {
            file: Joi.any().required().meta({ swaggerType: 'file' }).description('File'),
            type: Joi.string().description('Type'),
            filename: Joi.string().description('File name'),
            old_filename: Joi.any().description('Older file name'),
            //extension: Joi.string().description('Extension')

        }
    },
    payload: {
        maxBytes: 200048576,
        parse: true,
        allow: 'multipart/form-data',
        output: 'stream'
    },
    description: 'Handle Upload File',
    tags: ['api'],
    plugins: {
        'hapi-swagger': {
            responses: {
                '400': {
                    'description': 'Bad Request'
                }
            },
            payloadType: 'form'
        }
    },
}

exports.uploadImageToCloud = {
    auth: false,
    handler: function(request, reply) {
        var configManager = request.server.configManager;
        var data = request.payload;
        // console.log("data", data);
        // let base64Image = 'data:' + data.filetype + ";base64," + data.file.toString('base64');
        // console.log("base64Image", base64Image);

        cloudinary.config({
            cloud_name: 'phongnguyen',
            api_key: '436381725774579',
            api_secret: 'K86C4k-eYfiwBVld_l9ShS-cYKY'
        });

        // cloudinary.uploader.upload(data, function(result) {
        //     console.log("result", result);
        // });



        // blobToBase64(blob, function(error, base64) {
        //     if (!error) {
        //         document.querySelector('.result').innerHTML = base64
        //     }
        // });
        // console.log("data", data);
        function saveTempFile(folderPath) {
            let filePath = path.join(folderPath, "temp_upload_image." + data.fileExt);
            var file = fs.createWriteStream(filePath);
            file.on('error', function(err) {
                // request.log(['error', 'upload'], err);
                // request.log(['error'], err);
                // console.log("Err1", err);
                return reply({
                    status: 0
                });
            });
            data.file.pipe(file);
            data.file.on('end', function(err) {
                if (err) {
                    // request.log(['error', 'upload'], err);
                    return reply(err);
                }
                // console.log("filePath", filePath);
                cloudinary.v2.uploader.upload(filePath, function(err, result) {
                    // console.log({ err, result });
                    if (err) {
                        return reply({
                            status: 0
                        });
                    }
                    return reply({
                        status: 1,
                        imageUrl: result.url
                    });
                });
            });
        }
        let folderPath = path.join(configManager.get('web.upload.path'), "temp");
        if (!fs.existsSync(folderPath)) {
            mkdirp(folderPath, function(err, result) {
                saveTempFile(folderPath);
            });
        } else {
            saveTempFile(folderPath);
        }
    },
    // validate: {
    //     payload: {
    //         file: Joi.any().required().meta({ swaggerType: 'file' }).description('File'),
    //         type: Joi.string().description('Type'),
    //         filename: Joi.string().description('File name'),
    //         old_filename: Joi.any().description('Older file name'),
    //         //extension: Joi.string().description('Extension')

    //     }
    // },
    payload: {
        maxBytes: 200048576,
        parse: true,
        allow: 'multipart/form-data',
        output: 'stream',
        // output: 'data',
        // output: 'file',
    },
    description: 'Handle Upload File',
    tags: ['api'],
    plugins: {
        'hapi-swagger': {
            responses: {
                '400': {
                    'description': 'Bad Request'
                }
            },
            payloadType: 'form'
        }
    },
}

exports.deleteFile = {
    auth: false,
    handler: function(request, reply) {
        var configManager = request.server.configManager;
        var data = request.payload;
        if (data.filename) {
            var old_path = path.join(configManager.get('web.upload.path'), data.filename);
            fs.unlink(old_path, function(err) {
                if (err) {
                    console.log("Err: ", err);
                }
                return reply("Done!");
            })
        }
    },
    validate: {
        payload: {
            filename: Joi.any().description('File name'),
        }
    },
};