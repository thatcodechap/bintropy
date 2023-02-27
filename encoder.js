// Uses built-in zlib to deflate image data to png.
import { deflateSync } from 'node:zlib';

export default function encodeBufferToPNG(buffer,mime,width,height){
    if(!buffer)
        throw new Error("Buffer required");

    // Image metadata
    mime = mime || 'txt';
    width = width || 1920;
    height = height || 1080;

    const bitDepth = 1;
    const maxRawImageDataSize = (width*height)/8 + height;
    const filterPosition = width/8 + 1;

    const pngSignatureBuffer = Buffer.from([137,80,78,71,13,10,26,10]);
    const IENDchunkBuffer = Buffer.from('0000000049454E44AE426082','hex');

    // Create IHDR Chunk
    let IHDRchunkBuffer = Buffer.alloc(25);
    IHDRchunkBuffer.write('0000000D49484452','hex');
    IHDRchunkBuffer.writeUint32BE(width,8);
    IHDRchunkBuffer.writeUInt32BE(height,12);
    IHDRchunkBuffer.writeUInt8(bitDepth,16);
    IHDRchunkBuffer.writeUint32BE(0,17);

    // Create image data from file and add filters.
    let rawImageDataBuffer = Buffer.alloc(maxRawImageDataSize,0);
    const dataBufferSize = buffer.length;
    if(dataBufferSize > (width*height)/8)
        throw new Error("Image size not sufficient for the given data");
    let i=0,j=0;
    while(i < maxRawImageDataSize && j < buffer.length){
        if(i == 0 || i%filterPosition == 0){
            rawImageDataBuffer[i] == 0;
            i++;
            continue;
        }
        rawImageDataBuffer[i] = buffer[j];
        i++;
        j++;
    }

    // Deflate image data and create IDAT Chunk
    let dataStreamBuffer = deflateSync(rawImageDataBuffer,{
        level: 1,
    });
    let IDATheaderBuffer = Buffer.alloc(8);
    IDATheaderBuffer.writeUint32BE(dataStreamBuffer.length);
    IDATheaderBuffer.write('IDAT',4);
    let IDATchunkBuffer = Buffer.concat([IDATheaderBuffer,dataStreamBuffer,Buffer.alloc(4)]);

    // Create tEXT chunk with comments about file for decoding purpose
    const text = `.${mime}/${dataBufferSize.toString()}`;
    let textChunkBuffer = Buffer.alloc(20 + text.length);
    textChunkBuffer.writeUint32BE(8 + text.length);
    textChunkBuffer.write('tEXt', 4);
    textChunkBuffer.write('Comment', 8);
    textChunkBuffer.write(text,16);

    // Write image to a png file
    let imageBuffer = Buffer.concat([pngSignatureBuffer,IHDRchunkBuffer,IDATchunkBuffer,textChunkBuffer,IENDchunkBuffer]);
    return imageBuffer;
}