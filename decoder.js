// Uses zlib to inflate the data stream from png
import { inflateSync } from 'node:zlib';

export default function decodePNGToBuffer(pngFileBuffer){
    if(!pngFileBuffer)
        throw new Error("Input file required");   

    //Note: this decoder assumes all the files in the given folder are valid png files
    // Does not check for png signature
    let offset = 16;
    const width = pngFileBuffer.readUint32BE(offset);
    offset += 4;
    const height = pngFileBuffer.readUint32BE(offset);
    offset += 13;
    const filterPosition = width/8 + 1;
    let dataStreamSize = pngFileBuffer.readUInt32BE(offset);
    offset += 8;
    let dataStreamBuffer = pngFileBuffer.subarray(offset,offset + dataStreamSize);
    offset += dataStreamSize + 4;
    let rawImageDataBuffer = inflateSync(dataStreamBuffer);
    let textDataSize = pngFileBuffer.readUint32BE(offset);
    offset += 8;
    let textBuffer = pngFileBuffer.subarray(offset,offset+textDataSize);
    let comment = textBuffer.toString().split('.')[1].split('/');
    let dataBuffer = Buffer.alloc(parseInt(comment[1],10));
    let i=0,j=0;
    while(i < dataBuffer.length && j < rawImageDataBuffer.length){
        if(j == 0 || j%filterPosition == 0){
            j++;
            continue;
        }
        dataBuffer[i] = rawImageDataBuffer[j];
        i++;
        j++;
    }
    return {buffer: dataBuffer,mime: comment[0]};
}