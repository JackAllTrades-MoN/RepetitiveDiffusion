import os
from PIL import Image
from diffusers import StableDiffusionImg2ImgPipeline
import torch
from torch import autocast

TOKEN=os.environ.get('HUG_TOKEN')

pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
  "CompVis/stable-diffusion-v1-4",
  revision="fp16",
  torch_dtype=torch.float16,
  use_auth_token=TOKEN
).to("cuda")

def convert(prompt, input_path, output_path, strength=0.7):
  image = Image.open(input_path).convert("RGB").resize((512, 512))

  with autocast("cuda"):
    images = pipe(
      prompt=prompt,
      negative_prompt="((((mutated hands and fingers)))), deformed, blurry, bad anatomy, disfigured, poorly drawn face, mutation, mutated, extra limb, ugly, poorly drawn hands, missing limb, blurry, floating limbs, disconnected limbs, malformed hands, blur, out of focus, long neck, long body, text, title, multiple eyes",
      image=image,
      strength=strength,
      guidance_scale=7.5,
      num_inference_steps=50,
    ).images

  images[0].save(output_path)

