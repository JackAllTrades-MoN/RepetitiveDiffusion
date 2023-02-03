import React, { createRef, useEffect, useState } from "react";
import { Slider, Stack, Button, IconButton, ButtonGroup, TextField, InputLabel, Typography, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { Undo, Redo, UploadFile, Download, Edit, CropPortrait, FormatColorFill, Colorize } from '@mui/icons-material';
import { img2img, getResultI2I } from "./api";

interface MenuItemsProps {
    fontSize: number;
    red: number;
    green: number;
    blue: number;
    prompt: string;
    tool: string;
    undoBuffer: Array<ImageData>;
    redoBuffer: Array<ImageData>;
    setFontSize: React.Dispatch<React.SetStateAction<number>>;
    setRed: React.Dispatch<React.SetStateAction<number>>;
    setGreen: React.Dispatch<React.SetStateAction<number>>;
    setBlue: React.Dispatch<React.SetStateAction<number>>;
    setPrompt: React.Dispatch<React.SetStateAction<string>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setTool: React.Dispatch<React.SetStateAction<string>>;
    setUndoBuffer: React.Dispatch<React.SetStateAction<Array<ImageData>>>;
    setRedoBuffer: React.Dispatch<React.SetStateAction<Array<ImageData>>>;
}

const MenuItems = (props: MenuItemsProps) => {
    const {
        fontSize,
        red,
        green,
        blue,
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
        setRedoBuffer,
    } = props;
    const colorChecker = createRef<HTMLDivElement>();

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

    const undo = () => {
        const [cv, ctx] = getMainCanvasAndContext();
        const old = undoBuffer.pop();
        if (old && cv && ctx) {
            const current = ctx.getImageData(0, 0, cv.width, cv.height);
            setRedoBuffer(redoBuffer.concat([current]));
            ctx.putImageData(old, 0, 0);
        }
    };

    const redo = () => {
        const [cv, ctx] = getMainCanvasAndContext();
        const old = redoBuffer.pop();
        if (old && cv && ctx) {
            const current = ctx.getImageData(0, 0, cv.width, cv.height);
            setUndoBuffer(undoBuffer.concat([current]));
            ctx.putImageData(old, 0, 0);
        }
    };

    const updateColor = () => {
        const checker = colorChecker.current;
        if (checker) {
            checker.style.width = "80%";
            checker.style.height = "80%";
            checker.style.backgroundColor = `rgb(${red},${green},${blue})`;
        }
    };

    const updateImage = () => {
        const [cv, ctx] = getMainCanvasAndContext();
        if (!cv) console.log("canvas not found");
        if (!ctx) console.log("context cannot be obtained");
        if (cv && ctx) {
            getResultI2I()
            .then(img => {
                console.log("succeeded");
                addCanvasLog();
                console.log("logged");
                ctx.drawImage(img, 0, 0, img.width, img.height,0, 0, cv.width, cv.height);
                setIsLoading(false);
            })
            .catch(e => {
                setTimeout(() => {
                    updateImage();
                }, 5000);
            })
        }
    }

    const runImg2Img = () => {
        const [cv, _ctx] = getMainCanvasAndContext();
        setIsLoading(true);
        if (cv) {
            cv.toBlob(blob => {
                if (blob !== null) {
                    img2img(blob, prompt, 0.7)
                        .then(res => { updateImage(); })
                        .catch(e => { console.log(e); });
                }
            });
        }
    };

    const downloadImage = () => {
        const [cv, _ctx] = getMainCanvasAndContext();
        if (cv) {
            const link = document.createElement("a");
            link.href = cv.toDataURL();
            link.download = "output.png";
            link.click();
        }
    };

    useEffect(() => {
        updateColor();
    }, []);

    useEffect(() => {
        updateColor();
    }, [red, blue, green])

    return (
        <Stack padding={"5px"} spacing={2} width="16vw" border={"2px solid #000000"}>
            <ButtonGroup>
                <IconButton aria-label="upload-image"><UploadFile /></IconButton>
                <IconButton aria-label="download-image" onClick={e => downloadImage()}><Download /></IconButton>
                <IconButton aria-label="undo" onClick={e => undo()}><Undo /></IconButton>
                <IconButton aria-label="redo" onClick={e => redo()}><Redo /></IconButton>
            </ButtonGroup>
            <Typography>Tools</Typography>
            <ToggleButtonGroup
                exclusive
                aria-label="tools"
                value={tool}
                onChange={(_e, newValue) => setTool(newValue)}
            >
                <ToggleButton value="pen">
                    <Edit />
                </ToggleButton>
                <ToggleButton value="eraser">
                    <CropPortrait />
                </ToggleButton>
                <ToggleButton value="bucket">
                    <FormatColorFill />
                </ToggleButton>
                <ToggleButton value="spoit">
                    <Colorize />
                </ToggleButton>
            </ToggleButtonGroup>
            <Typography>PenSize</Typography>
            <Slider
                aria-label="PenSize"
                min={1}
                max={500}
                step={1}
                value={fontSize}
                onChange={(e, newValue) => setFontSize(newValue as number)}
                valueLabelDisplay="auto"
            />
            <Stack direction="row" spacing={2}>
                <Typography>Color</Typography>
                <div ref={colorChecker}></div>
            </Stack>
            <Stack direction="row" spacing={2}>
                <Typography>R:</Typography>
                <Slider
                    aria-label="R"
                    min={0}
                    max={255}
                    step={1}
                    value={red}
                    onChange={(_e, newValue) => {
                        setRed(newValue as number);
                    }}
                    valueLabelDisplay="auto"
                />
            </Stack>
            <Stack direction="row" spacing={2}>
                <Typography>G:</Typography>
                <Slider
                    aria-label="G"
                    min={0}
                    max={255}
                    step={1}
                    value={green}
                    onChange={(_e, newValue) => {
                        setGreen(newValue as number);
                    }}
                    valueLabelDisplay="auto"
                />
            </Stack>
            <Stack direction="row" spacing={2}>
                <Typography>B:</Typography>
                <Slider
                    aria-label="B"
                    min={0}
                    max={255}
                    step={1}
                    value={blue}
                    onChange={(_e, newValue) => {
                        setBlue(newValue as number);
                    }}
                    valueLabelDisplay="auto"
                />
            </Stack>
            <InputLabel>Prompt</InputLabel>
            <TextField
                multiline
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
            />
            <Button
                variant="contained"
                onClick={e => runImg2Img()}
            >img2img</Button>
        </Stack>
    );
};

export default MenuItems