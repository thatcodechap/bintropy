/* 
// Use package.json to set JS modules type to ES6
NOTE: This program doesn't managed memory which get directly loaded into memory
So beware of opening huge files.
*/

import encodeBufferToPNG from './encoder.js';
import decodePNgToBuffer from './decoder.js';
import { readFileSync,writeFileSync , mkdirSync,opendirSync, opendir} from 'fs';

// To format the png files Eg: img00001.png
function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

// Outputs the resultant images in 'output' folder in the program folder
function generateBinaryImages(path){
    console.time(path);
    let pathSplit = path.split('/');
    const maxImageSize = 259200;
    let fileBuffer = readFileSync(path);
    let filename = pathSplit[pathSplit.length - 1].split('.');
    let mime = filename[filename.length - 1];
    let imageBuffer;
    if(fileBuffer.length > 259200){
        let start = 0;
        let end = maxImageSize;
        let bufferArray = [];
        let count = 1;
        while(end < fileBuffer.length){
            imageBuffer = encodeBufferToPNG(fileBuffer.subarray(start,end),mime);
            bufferArray.push(imageBuffer);
            start = end;
            end += maxImageSize;
            count++;
        }
        if(end != fileBuffer.length){
            imageBuffer = encodeBufferToPNG(fileBuffer.subarray(start,fileBuffer.length),mime);
            bufferArray.push(imageBuffer);
        }
        mkdirSync('output');
        bufferArray.forEach((imageBuffer,index)=>{
            writeFileSync(`output/img${pad(index+1,5)}.png`,imageBuffer)
        })
    }else{
        imageBuffer = encodeBufferToPNG(fileBuffer,mime);
        writeFileSync('output.png',imageBuffer);
    }
    console.timeEnd(path);
}

// Generates the file from the given png files in the program folder.
function generateFile(path){
    if(path[path.length-1] != '/')
        path = path + '/';
    console.time(path);
    let dir = opendirSync(path);
    let file;
    let fileBufferObject = {};
    let partialFileBuffer;
    let imageBuffer;
    let mime;
    while(file = dir.readSync()){
        imageBuffer = readFileSync(dir.path + file.name);
        partialFileBuffer = decodePNgToBuffer(imageBuffer);
        fileBufferObject[file.name.split('.')[0]] = partialFileBuffer.buffer;
    }
    let fileBufferArray = [];
    let count = 1;
    while(fileBufferObject['img'+pad(count,5)]){
        fileBufferArray.push(fileBufferObject['img'+pad(count,5)].subarray());
        count++;
    }
    writeFileSync('output.'+partialFileBuffer.mime,Buffer.concat(fileBufferArray));
    dir.close();
    console.timeEnd(path);
};

// To take arguments from the console.
if(process.argv[2] == 'encode'){
    generateBinaryImages(process.argv[3]);
}else if(process.argv[2] == 'decode')
    generateFile(process.argv[3]);