import React, { useEffect, useRef, useState } from 'react';
import {
  Cartesian3,
  createGooglePhotorealistic3DTileset,
  Ion,
  Math as CesiumMath,
  Viewer,
} from 'cesium';

// --- IMPORTANT ---
// This line is still critical.
(window as any).CESIUM_BASE_URL = '/cesium/';

Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNDdiNWY1MC1hZDJhLTQ3NjItODIxOC03MmM1Mzk0MzNkNDUiLCJpZCI6MzQwMTEwLCJpYXQiOjE3NTc1MDc5MDR9.cyUvzRrufzlkzGqfd0miOY6y4CabqJ4Ob2o-0DG2slY";

const HomePage: React.FC = () => {
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<Viewer | null>(null);

  // Initialize the Cesium Viewer
  useEffect(() => {
    if (cesiumContainer.current && !viewer) {
      const newViewer = new Viewer(cesiumContainer.current, {
        timeline: false,
        animation: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        baseLayerPicker: false,
        navigationHelpButton: false,
        infoBox: false,
        selectionIndicator: false,
        fullscreenButton: false,
      });

      // Load the Google Photorealistic 3D Tiles
      const loadTiles = async () => {
        try {
          const tileset = await createGooglePhotorealistic3DTileset();
          newViewer.scene.primitives.add(tileset);
        } catch (error) {
          console.error(`Failed to load 3D tiles: ${error}`);
        }
      };
      loadTiles();

      setViewer(newViewer);
    }

    return () => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.destroy();
      }
    };
  }, []); // Run only once on mount

  // Fly to VIT Pune
  const handleFlyTo = () => {
    if (viewer) {
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(73.8507, 18.4582, 800), // lng, lat, height (in meters)
        orientation: {
          heading: CesiumMath.toRadians(0.0),
          pitch: CesiumMath.toRadians(-45.0), // Angle down
        },
        duration: 5, // seconds
      });
    }
  };

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '90vh',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
  };

  const uiContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '80px',
    left: '20px',
    zIndex: 10,
    background: 'rgba(255, 255, 255, 0.8)',
    padding: '10px',
    borderRadius: '5px',
  };

  return (
    <div>
      <div style={uiContainerStyle}>
        <input type="text" placeholder="e.g., VIT Pune" style={{ marginRight: '10px' }} />
        <button onClick={handleFlyTo}>Fly to VIT Pune</button>
      </div>
      <div ref={cesiumContainer} style={containerStyle} />
    </div>
  );
};

export default HomePage;