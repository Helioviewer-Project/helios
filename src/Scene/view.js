import React, { useEffect, useState } from 'react';
import Scene from './scene';

export default function SceneView() {
    let scene = null;
    useEffect(() => {
        scene = new Scene('js-three-scene');
    })
    return <div id='js-three-scene'></div>;
}