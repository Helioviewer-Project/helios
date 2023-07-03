import React from "react";

type PlayerProps = {
    frameCount: number;
    currentFrame: number;
    className: string;
    /** Sets the current frame */
    SetFrame: (frame: number) => void
};

/**
 * Implements step based movie player to look more like a standard movie player
 */
class MoviePlayerFacade extends React.Component<PlayerProps, {}> {
    constructor(props: PlayerProps) {
        super(props);
    }

    render(): React.ReactNode {
        return <input
            className={this.props.className}
            type="range"
            min={0}
            max={this.props.frameCount}
            value={this.props.currentFrame}
            disabled={this.props.frameCount == 0}
            onChange={(e) => this.props.SetFrame(parseInt(e.target.value))}/>
    }
}

export { MoviePlayerFacade }