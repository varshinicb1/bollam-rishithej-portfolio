import math
import os
import subprocess
from PIL import Image, ImageDraw

def render_3d_loop():
    width = 1280
    height = 720
    fps = 30
    duration_sec = 4
    total_frames = fps * duration_sec
    temp_dir = "temp_3d_frames"
    os.makedirs(temp_dir, exist_ok=True)

    # 3D points for concentric revolving spatial rings and particle galaxy
    particles = []
    # Ring 1: outer tilted ring
    for i in range(120):
        theta = (2 * math.pi * i) / 120
        r = 320
        particles.append({'r': r, 'theta': theta, 'type': 'ring1', 'size': 2.5, 'color': (198, 255, 53)})

    # Ring 2: inner tilted ring opposite direction
    for i in range(90):
        theta = (2 * math.pi * i) / 90
        r = 220
        particles.append({'r': r, 'theta': theta, 'type': 'ring2', 'size': 2.0, 'color': (71, 191, 255)})

    # Core sphere particles
    for i in range(150):
        phi = math.acos(1 - 2 * (i + 0.5) / 150)
        theta = math.pi * (1 + 5**0.5) * i
        r = 140
        particles.append({'r': r, 'theta': theta, 'phi': phi, 'type': 'core', 'size': 1.8, 'color': (126, 20, 255)})

    # Floating ambient dust
    import random
    random.seed(42)
    dust = []
    for _ in range(100):
        dust.append({
            'x': random.uniform(-400, 400),
            'y': random.uniform(-250, 250),
            'z': random.uniform(-300, 300),
            'speed': random.uniform(0.5, 1.5),
            'size': random.uniform(1.0, 2.2),
            'alpha': random.uniform(0.3, 0.8)
        })

    fov = 600
    camera_z = 800

    print(f"Rendering {total_frames} frames...")

    for f in range(total_frames):
        t = f / total_frames
        angle1 = 2 * math.pi * t
        angle2 = -2 * math.pi * t
        tilt_x = math.radians(25 + 10 * math.sin(angle1))
        tilt_y = math.radians(35)

        img = Image.new("RGBA", (width, height), (3, 5, 8, 255))
        draw = ImageDraw.Draw(img)

        # Draw subtle radial background glow
        glow_alpha = int(40 + 15 * math.sin(angle1))
        for r_glow in range(400, 50, -50):
            a = int(glow_alpha * (1.0 - r_glow / 400))
            draw.ellipse(
                [width//2 - r_glow, height//2 - r_glow, width//2 + r_glow, height//2 + r_glow],
                fill=(10, 25, 55, a)
            )

        rendered_dots = []

        # Ambient dust
        for d in dust:
            cur_z = (d['z'] + t * d['speed'] * 200) % 600 - 300
            scale = fov / (fov + camera_z + cur_z)
            sx = int(width // 2 + d['x'] * scale)
            sy = int(height // 2 + d['y'] * scale)
            sz = max(1, d['size'] * scale)
            alpha = int(255 * d['alpha'] * (1 - abs(cur_z)/350))
            if 0 <= sx < width and 0 <= sy < height and alpha > 0:
                rendered_dots.append((cur_z, sx, sy, sz, (180, 210, 255, alpha)))

        # 3D Ring 1
        for p in particles:
            if p['type'] == 'ring1':
                th = p['theta'] + angle1
                x = p['r'] * math.cos(th)
                y = p['r'] * math.sin(th)
                z = 0
                # Rotate X then Y
                y1 = y * math.cos(tilt_x) - z * math.sin(tilt_x)
                z1 = y * math.sin(tilt_x) + z * math.cos(tilt_x)
                x2 = x * math.cos(tilt_y) + z1 * math.sin(tilt_y)
                z2 = -x * math.sin(tilt_y) + z1 * math.cos(tilt_y)

                scale = fov / (fov + camera_z + z2)
                sx = int(width // 2 + x2 * scale)
                sy = int(height // 2 + y1 * scale)
                sz = max(1.2, p['size'] * scale * 1.5)
                alpha = int(180 + 75 * (z2 / 300))
                alpha = max(30, min(255, alpha))
                rendered_dots.append((z2, sx, sy, sz, (*p['color'], alpha)))

            elif p['type'] == 'ring2':
                th = p['theta'] + angle2
                x = p['r'] * math.cos(th)
                y = p['r'] * math.sin(th)
                z = 0
                t_x = math.radians(-30 + 8 * math.cos(angle1))
                t_y = math.radians(-40)
                y1 = y * math.cos(t_x) - z * math.sin(t_x)
                z1 = y * math.sin(t_x) + z * math.cos(t_x)
                x2 = x * math.cos(t_y) + z1 * math.sin(t_y)
                z2 = -x * math.sin(t_y) + z1 * math.cos(t_y)

                scale = fov / (fov + camera_z + z2)
                sx = int(width // 2 + x2 * scale)
                sy = int(height // 2 + y1 * scale)
                sz = max(1.0, p['size'] * scale * 1.4)
                alpha = int(170 + 80 * (z2 / 250))
                alpha = max(30, min(255, alpha))
                rendered_dots.append((z2, sx, sy, sz, (*p['color'], alpha)))

            elif p['type'] == 'core':
                th = p['theta'] + angle1 * 0.7
                ph = p['phi']
                x = p['r'] * math.sin(ph) * math.cos(th)
                y = p['r'] * math.cos(ph)
                z = p['r'] * math.sin(ph) * math.sin(th)

                # Slow tumble
                r_ang = angle1 * 0.4
                x1 = x * math.cos(r_ang) + z * math.sin(r_ang)
                z1 = -x * math.sin(r_ang) + z * math.cos(r_ang)

                scale = fov / (fov + camera_z + z1)
                sx = int(width // 2 + x1 * scale)
                sy = int(height // 2 + y * scale)
                sz = max(1.0, p['size'] * scale * 1.3)
                alpha = int(140 + 70 * (z1 / 150))
                alpha = max(20, min(220, alpha))
                rendered_dots.append((z1, sx, sy, sz, (*p['color'], alpha)))

        # Sort back to front (Painter's algorithm)
        rendered_dots.sort(key=lambda d: d[0])

        for _, sx, sy, sz, col in rendered_dots:
            draw.ellipse([sx - sz, sy - sz, sx + sz, sy + sz], fill=col)

        frame_path = os.path.join(temp_dir, f"frame_{f:04d}.png")
        img.save(frame_path)

    print("Frames finished. Encoding video via FFmpeg...")
    # Encode MP4
    mp4_out = "dist/assets/hero-3d-loop.mp4"
    webm_out = "dist/assets/hero-3d-loop.webm"
    
    cmd_mp4 = [
        "ffmpeg", "-y", "-r", str(fps),
        "-i", os.path.join(temp_dir, "frame_%04d.png"),
        "-c:v", "libx264", "-pix_fmt", "yuv420p",
        "-crf", "22", "-movflags", "+faststart",
        mp4_out
    ]
    subprocess.run(cmd_mp4, check=True)
    print("MP4 generated:", mp4_out)

    cmd_webm = [
        "ffmpeg", "-y", "-r", str(fps),
        "-i", os.path.join(temp_dir, "frame_%04d.png"),
        "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "30",
        webm_out
    ]
    subprocess.run(cmd_webm, check=True)
    print("WebM generated:", webm_out)

    # Cleanup temp frames
    for f in os.listdir(temp_dir):
        os.remove(os.path.join(temp_dir, f))
    os.rmdir(temp_dir)
    print("All done!")

if __name__ == "__main__":
    render_3d_loop()
