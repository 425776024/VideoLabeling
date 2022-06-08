import os

video_dir = './data/video'
frame_dir = './data/frame'
mp4_list = sorted(os.listdir(video_dir))
mp4_list = [m for m in mp4_list if '.mp4' in m]

t_step = 0.04

frame_file = open('./data/frame.txt', 'w')
video_file = open('./data/video.txt', 'w')

frame_file.write(f'URLID,Frame,Time\n')
video_file.write(f'URLID,URL\n')

for idx, video in enumerate(mp4_list):
    idx_str = "%.3d" % (idx)
    mp4_path = os.path.join(video_dir, video)
    video_file.write(f'{idx_str},{mp4_path}\n')

    mp4_name = video.split('.')[0]
    mp4_frame_dir = os.path.join(frame_dir, mp4_name)
    if not os.path.exists(mp4_frame_dir):
        os.mkdir(mp4_frame_dir)
        os.system(
            f"ffmpeg -i {mp4_path}  {mp4_frame_dir}/%05d.png"
        )

    img_list = sorted(os.listdir(mp4_frame_dir))
    t = 0
    for img in img_list:
        t_str = "%.2f" % (t)
        img = os.path.join(mp4_frame_dir, img)
        line = f'{idx_str},{img},{t_str}\n'
        frame_file.write(line)
        t += t_step
