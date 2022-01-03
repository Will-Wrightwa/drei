import * as React from 'react'
import * as THREE from 'three'
import { withKnobs, boolean } from '@storybook/addon-knobs'
import { useControls, button } from 'leva'
import CamControls from 'camera-controls'
import { Setup } from '../Setup'

import { CameraControls, Box, useFBO, Plane, PerspectiveCamera, useAspect } from '../../src'
import { createPortal, useFrame, Canvas, useThree } from '@react-three/fiber'
import { ComponentStory, ComponentMeta } from '@storybook/react'

const setupDecorator = (storyFn) => <Setup controls={false}>{storyFn()}</Setup>
function CameraControlsTemplate() {
  return (
    <>
      <CameraControls verticalDragToForward={boolean('Vertical Drag To Forward', true)} />
      <Box>
        <meshBasicMaterial attach="material" wireframe />
      </Box>
    </>
  )
}

export const CameraControlsStory = CameraControlsTemplate.bind({})
CameraControlsStory.decorators = [setupDecorator]
CameraControlsStory.storyName = 'Default'

const BasicScene = () => {
  const [ctrls, set] = React.useState<CamControls>()
  const [mesh, setMesh] = React.useState<THREE.Box3>()
  const [cam, camRef] = React.useState<THREE.Camera>()
  const props = useControls(
    {
      verticalDragToForward: false,
      dollyToCursor: false,
      infinityDolly: false,
      'rotate theta 45\u00B0': button(() => ctrls?.rotate(45 * THREE.MathUtils.DEG2RAD, 0, true)),
      'rotate theta -90\u00B0': button(() => ctrls?.rotate(-90 * THREE.MathUtils.DEG2RAD, 0, true)),
      'rotate theta 360\u00B0': button(() => ctrls?.rotate(360 * THREE.MathUtils.DEG2RAD, 0, true)),
      'rotate phi 20\u00B0': button(() => ctrls?.rotate(0, 20 * THREE.MathUtils.DEG2RAD, true)),
      'truck( 1, 0)': button(() => ctrls?.truck(1, 0, true)),
      'truck( 0, 1)': button(() => ctrls?.truck(0, 1, true)),
      'truck( -1, -1)': button(() => ctrls?.truck(-1, -1, true)),
      'dolly(  1, true )': button(() => ctrls?.dolly(1, true)),
      'dolly(  -1, true )': button(() => ctrls?.dolly(-1, true)),
      'zoom  2': button(() => ctrls?.zoom(ctrls.camera.zoom / 2, true)),
      '-zoom  2': button(() => ctrls?.zoom(-ctrls.camera.zoom / 2, true)),
      'move to( 3, 5, 2 )': button(() => ctrls?.moveTo(3, 5, 2, true)),
      'fit to bounding box of mesh': button(() => mesh && ctrls?.fitToBox(mesh, true)),
      'move to ( -5, 2, 1 )': button(() => ctrls?.setPosition(-5, 2, 1, true)),
      'look at ( 3, 0, -3 )': button(() => ctrls?.setTarget(3, 0, -3, true)),
      'move to ( 1, 2, 3 ), look at ( 1, 1, 0 )': button(() => ctrls?.setLookAt(1, 2, 3, 1, 1, 0, true)),
      'move to somewhere between ( -2, 0, 0 ) -> ( 1, 1, 0 ) and ( 0, 2, 5 ) -> ( -1, 0, 0 )': button(() =>
        ctrls?.lerpLookAt(-2, 0, 0, 1, 1, 0, 0, 2, 5, -1, 0, 0, Math.random(), true)
      ),
      reset: button(() => ctrls?.reset(true)),
      saveState: button(() => ctrls?.saveState()),
      'mouse/touch  controls enabled': false,
    },
    [ctrls, mesh]
  )

  const size = useThree(({ size }) => size)

  return (
    <>
      <PerspectiveCamera
        position={[0, 0, 5]}
        args={[60, size.width / size.height, 0.01, 100]}
        makeDefault
        ref={camRef}
      />
      <CameraControls ref={set} camera={cam} {...props} />
      <Box ref={setMesh} args={[1, 1, 1]}>
        <meshBasicMaterial attach="material" wireframe color="red" />
      </Box>
      <gridHelper args={[50, 50]} position={[0, -1, 0]} />
    </>
  )
}

export const Foo = () => (
  <Canvas>
    <BasicScene />
  </Canvas>
)
// Foo.decorators = [
//   setupDecorator
// ]

export default {
  title: 'Controls/CameraControls',
  component: CameraControls,
  // decorators: [withKnobs, (storyFn) => <Setup controls={false}>{storyFn()}</Setup>],
} as ComponentMeta<typeof CameraControls>

function CustomCamera() {
  /**
   * we will render our scene in a render target and use it as a map.
   */
  const fbo = useFBO(400, 400)
  const virtualCamera = React.useRef<THREE.Camera>()
  const [virtualScene] = React.useState(() => new THREE.Scene())

  useFrame(({ gl }) => {
    if (virtualCamera.current) {
      gl.setRenderTarget(fbo)
      gl.render(virtualScene, virtualCamera.current)

      gl.setRenderTarget(null)
    }
  })

  return (
    <>
      <Plane args={[4, 4, 4]}>
        <meshBasicMaterial map={fbo.texture} />
      </Plane>

      {createPortal(
        <>
          <Box>
            <meshBasicMaterial attach="material" wireframe />
          </Box>

          <PerspectiveCamera name="FBO Camera" ref={virtualCamera} position={[0, 0, 5]} />

          <CameraControls camera={virtualCamera.current} />

          {/* @ts-ignore */}
          <color attach="background" args={['hotpink']} />
        </>,
        virtualScene
      )}
    </>
  )
}

export const CustomCameraStory = () => <CustomCamera />
CustomCameraStory.decorators = [setupDecorator]
CustomCameraStory.storyName = 'Custom Camera'
