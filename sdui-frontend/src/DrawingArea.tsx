import LoadingCircle from "./LoadingCircle";
import { createUseStyles } from "react-jss";
import React, { createRef, useEffect, useState } from "react";
import { Container } from "@mui/system";

const useStyles = createUseStyles({
    root: {
        backgroundColor: "gray",
        border: "2px solid #000000",
        position: "relative",
        "&>*": {
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            margin: "auto",
        },
        "& #draw-canvas": {
            background: "linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%), linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%)",
            backgroundSize: "40px 40px",
            backgroundPosition: "0 0, 20px 20px",
        }
    },
    checker: {
        background: "linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%), linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%)",
        backgroundSize: "40px 40px",
        backgroundPosition: "0 0, 20px 20px",
    }
});

const getOffsetXY = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return [
        e.clientX - window.scrollX - rect.left,
        e.clientY - window.scrollY - rect.top
    ];
};

const getTouchOffsetXY = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = (e.touches[0].clientX - window.scrollX - rect.left);
    const offsetY = (e.touches[0].clientY - window.scrollY - rect.top);
    return [offsetX, offsetY];
};

interface DrawingAreaProps {
    fontSize: number
    color: string
    isLoading: boolean
    tool:string
    red: number
    green: number
    blue: number
    alpha: number
    addCanvasLog: () => void
    setColor: (r: number, g: number, b: number) => void
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

const DrawingArea = (props: DrawingAreaProps) => {
    const classes = useStyles();
    const [mouseHolded, setMouseHolded] = useState<boolean>(false);
    const [prevPoint, setPrevPoint] = useState<[number, number]>([0, 0]);
    const canvasContainer = createRef<HTMLDivElement>();
    const mainCanvas = createRef<HTMLCanvasElement>();

    const onMoveTo = (ctx: CanvasRenderingContext2D, x:number, y:number) => {
        const [px, py] = prevPoint;
        ctx.save();
        ctx.lineWidth = props.fontSize;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        if (mouseHolded) {
            if (props.tool === "pen") {
                ctx.strokeStyle = props.color;
                ctx.globalCompositeOperation = 'source-over';
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.closePath();
                setPrevPoint([x, y]);
            } else if (props.tool === "eraser") {
                ctx.strokeStyle = "rgba(0, 0, 0, 1)";
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.closePath();
                setPrevPoint([x, y]);
            }
        }
        ctx.restore();
    }

    const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const [x, y] = getOffsetXY(e);
        const canvas: HTMLCanvasElement = e.currentTarget;
        const ctx = canvas.getContext("2d");
        if (ctx !== null) {
            onMoveTo(ctx, x, y);
        }
    };

    const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const [x, y] = getTouchOffsetXY(e);
        const canvas: HTMLCanvasElement = e.currentTarget;
        const ctx = canvas.getContext("2d");
        if (ctx !== null) {
            onMoveTo(ctx, x, y);
        }
    };

    const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        props.addCanvasLog();
        const [x, y] = getOffsetXY(e);
        setMouseHolded(true);
        setPrevPoint([x, y]);
    }

    const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
        props.addCanvasLog();
        const [x, y] = getTouchOffsetXY(e);
        setMouseHolded(true);
        setPrevPoint([x, y]);
    }

    const floodFill = (startX: number, startY: number) => {
        return new Promise<void>((resolve, reject) => {
            const canvas = mainCanvas.current;
            const ctx = canvas?.getContext("2d");
            if (canvas && ctx) {
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const checked = new Array<boolean>(canvas.width * canvas.height).fill(false);
                const stack = [[startX, startY]];
                const idxOf = (x: number, y:number) => (x + y * canvas.width) * 4;
                const getColorOf = (x: number, y: number) => imgData.data.slice(idxOf(x, y), idxOf(x,y) + 4);
                const setColorAt = (x: number, y: number) => {
                    checked[x + y * canvas.width] = true;
                    imgData.data[idxOf(x, y)] = props.red;
                    imgData.data[idxOf(x, y) + 1] = props.green;
                    imgData.data[idxOf(x, y) + 2] = props.blue;
                    imgData.data[idxOf(x, y) + 3] = 255;
                };
                const startColor = getColorOf(startX, startY);
                const isTarget = (x: number, y: number) => {
                    const isChecked = checked[x + y * canvas.width];
                    const colors = getColorOf(x, y);
                    const inRange = x >= 0 && y >= 0 && x < canvas.width && y < canvas.height;
                    return inRange && !isChecked && colors.toString() === startColor.toString();
                };
                let cell = null;
                while ((cell = stack.pop())) {
                    const [x, y] = cell;
                    setColorAt(x, y);
                    [
                        [-1,-1], [-1,0], [-1,1],
                        [0,-1], [0,1],
                        [1,-1], [1,0], [1,1]
                    ].map(d => {
                        const [dx, dy] = d;
                        if (isTarget(x+dx, y+dy)) {
                            stack.push([x+dx, y+dy]);
                        }
                    })
                }
                ctx.putImageData(imgData, 0, 0);
                resolve();
            } else {
                reject();
            }
        });
    };

    const onPointerRelease = (x: number, y: number) => {
        const canvas = mainCanvas.current;
        const ctx = canvas?.getContext("2d");
        setMouseHolded(false);
        if (props.tool === "spoit" && canvas && ctx) {
            const imgData = ctx.getImageData(x, y, 1, 1);
            props.setColor(
                imgData.data[0],
                imgData.data[1],
                imgData.data[2]
            );
        } else if (props.tool === "bucket") {
            props.setIsLoading(true);
            floodFill(Math.round(x), Math.round(y))
            .then(() => props.setIsLoading(false))
            .catch(() => console.log("error on fill"));
        }
    } 

    const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const [x, y] = getOffsetXY(e);
        onPointerRelease(x, y);
    };

    const onTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
        const [x, y] = getTouchOffsetXY(e);
        onPointerRelease(x, y);
    }

    const onMouseLeave = () => {
        setMouseHolded(false);
    };

    const resize = () => {
        const container = canvasContainer.current;
        const canvas = mainCanvas.current;
        if (container && canvas) {
            const minEdge = Math.min(
                container.offsetWidth,
                container.offsetHeight
            );
            canvas.width = minEdge;
            canvas.height = minEdge;
        }
    }

    useEffect(() => {
        resize();
        canvasContainer.current?.addEventListener("resize", resize);
        mainCanvas.current?.addEventListener('touchmove.is-fixed', e => {
            e.preventDefault();
        });
    }, []);

    return (
        <Container
            id="canvas-container"
            ref={canvasContainer}
            className={classes.root}
        >
            <canvas
                ref={mainCanvas}
                id="draw-canvas"
                className="canvas"
                {...{onMouseDown, onMouseUp, onMouseMove, onMouseLeave, onTouchMove, onTouchStart, onTouchEnd}}
            ></canvas>
            {(props.isLoading)?<LoadingCircle />:<React.Fragment></React.Fragment>}
        </Container>
    )
};

export default DrawingArea