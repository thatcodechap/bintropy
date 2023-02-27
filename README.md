# Bintropy


Its a lightweigh and simple tool which generates set of ordered png files where each png represents binary data of the file in each pixel.

**Motivation**:

Uploading normal files to youtube in the form a video.[This is the orignal idea](https://github.com/DvorakDwarf/Infinite-Storage-Glitch) I tried to replicate which is written in Rust. But unfortunately  I was not able to get the video back from youtube in the lossless form.

To generate a video out of the images produced, use `ffmpeg` with proper arguments for lossless encoding.

Eg: `ffmpeg -i <folder path>/img%05d.png -c:v ffv1 output.avi`

This generates a lossless video in `avi` format.

---
## Usage:

**Encode:**

```
node bintropy.js encode <path to input file>
```

**Decode:**

```
node bintropy.js decode <path to folder of png files>
```

---
### Note:

- **Beware of using large files, because the fs module is directly used to load the data into memory.**
- **For decoding,the program doesn't check for png validity. So the decoded file will be corrupted if other files are included in the given folder.**
- **Declare the `type` as `module` in `package.json`, as the program uses ES6 syntax for importing modules.**
