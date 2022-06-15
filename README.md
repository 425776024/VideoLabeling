# Video Labeling

Based on [annotation-tool](https://github.com/coin-dataset/annotation-tool)

### step 1
Prepare labels :`./data/label.txt`

### step 2
Copy mp4 files into: `./data/video` dir

### step 3 (Optional, If image annotation is not required)
Make txt files: python make_input.py (need ffmpeg)

### step 4
Chrome open: coin_annotation_tool.html

### step 5
Import txt file in webpage:
- video.txt, Video list
- label.txt, Label Information
- frame.txt, Images to be annotated for each video. (Optional, If image annotation is not required)
- history.txt, Information marked in history. (Exported via `Download` button)

![](./images/page.png)


![](./images/local.png)

![](./images/FrameMode.jpeg)