# RepetitiveDiffusion
An AI paint tool powered by stable diffusion.


https://user-images.githubusercontent.com/3920928/216596005-d490210f-3a7c-4222-8d0d-2d8bf273dccc.mp4



## Prerequisites
1. You need an access token of HuggingFace

TBD


## How to use

1. build the frontend

```bash
cd sdui-frontend
npm install .
npm run build
```

2. run the server

```bash
export HUG_TOKEN=<YOUR_ACCESS_TOKEN>
python -m flask --app sdui run -p 8080 --host 0.0.0.0
```

3. Then, access to localhost:8080 on your browser.
