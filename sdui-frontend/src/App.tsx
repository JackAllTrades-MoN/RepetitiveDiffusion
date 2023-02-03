import DrawingArea from "./DrawingArea";
import MenuItems from "./MenuItems";
import { useState } from "react";
import { Container, Stack } from "@mui/material";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    "@global": {
        html: {
            overflow: "hidden",
            overscrollBehavior: "none",
        },
        body: {
            overflow: "hidden"
        },
    },
});

const App = () => {
    useStyles();
    const [fontSize, setFontSize] = useState<number>(15);
    const [red, setRed] = useState<number>(0);
    const [green, setGreen] = useState<number>(0);
    const [blue, setBlue] = useState<number>(0);
    const [alpha, setAlpha] = useState<number>(1);
    const [prompt, setPrompt] = useState<string>("A chinchilla in the dark");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [tool, setTool] = useState<string>("pen");
    const [undoBuffer, setUndoBuffer] = useState<Array<ImageData>>([]);
    const [redoBuffer, setRedoBuffer] = useState<Array<ImageData>>([]);

    const color = `rgba(${red},${green},${blue},${alpha})`

    const setColor = (r:number, g:number, b:number, a?: number) => {
        setRed(r);
        setGreen(g);
        setBlue(b);
        if (a) { setAlpha(a); }
    };

    const getMainCanvasAndContext = () => {
        const canvas = document.getElementById("draw-canvas") as HTMLCanvasElement | null;
        const ctx = canvas?.getContext("2d");
        if (canvas && ctx) {
            const result : [HTMLCanvasElement, CanvasRenderingContext2D] = [canvas, ctx];
            return result;
        } else {
            throw new Error("failed to get canvas or its context.")
        }
    };

    const addCanvasLog = () => {
        const [cv, ctx] = getMainCanvasAndContext();
        if (cv && ctx) {
            const old = ctx.getImageData(0, 0, cv.width, cv.height);
            const newBuff = undoBuffer.concat([old]);
            while (newBuff.length > 15) {
                newBuff.shift();
            }
            setUndoBuffer(newBuff);
        }
        setRedoBuffer([]);
    };

    return (
        <Container>
            <Stack direction="row" spacing={2}>
                <DrawingArea {...{
                    fontSize,
                    color,
                    isLoading,
                    tool,
                    red,
                    green,
                    blue,
                    alpha,
                    addCanvasLog,
                    setColor,
                    setIsLoading
                }}/>
                <MenuItems {...{
                    fontSize,
                    red, green, blue,
                    prompt,
                    tool,
                    undoBuffer,
                    redoBuffer,
                    setFontSize,
                    setRed,
                    setGreen,
                    setBlue,
                    setPrompt,
                    setIsLoading,
                    setTool,
                    setUndoBuffer,
                    setRedoBuffer
                }}/>
            </Stack>
        </Container>
    );
}

export default App
