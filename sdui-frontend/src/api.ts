export const img2img = (image: Blob, prompt:string, strength:number) => {
    const formData = new FormData();
    formData.append("input_img", image);
    formData.append("data", JSON.stringify({
        "prompt": prompt,
        "strength": strength
    }));
    const param = {
        method: "POST",
        body: formData
    };
    return fetch("/img2img/upload", param).then(res => res.json())
}

const loadImage = (url: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
});

export const getResultI2I = () => {
    return loadImage(`/static/imgs/output.png?${(new Date).getTime()}`)
}