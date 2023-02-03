import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
    "@global": {
        "@-webkit-keyframes spCircRot": {
            "from": {
                "-webkit-transform": "rotate(0deg)",
            },
            "to": {
                "-webkit-transform": "rotate(359deg)",
            }
        },
        "@keyframes spCircRot": {
            "from": {
                "transform": "rotate(0deg)",
            },
            "to": {
                "transform": "rotate(359deg)",
            }
        },
        "#loading-circle": {
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            position: "absolute",
            width: "100%",
            height: "100%",
        },
        "#loading-circle-icon": {
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            margin: "auto",
        },
    },
    sp: {
        width: "25px",
        height: "25px",
        clear: "both",
    },
    spCircle: {
        border: "4px rgba(0, 0, 0, 0.25) solid",
        "border-top": "4px black solid",
        "border-radius": "50%",
        "-webkit-animation": "spCircRot .6s infinite linear",
        animation: "spCircRot .6s infinite linear",
    },
    hidden: {
        display: "none",
    }
});

const LoadingCircle = () => {
    const classes = useStyles();
    return (
        <div id="loading-circle">
            <div
                id="loading-circle-icon"
                className={`${classes.sp} ${classes.spCircle}`}></div>
        </div>
    );
};

export default LoadingCircle