import { EventManager, ReactThreeFiber, useFrame, useThree } from '@react-three/fiber'
import * as React from 'react'
import * as THREE from 'three'
import CamControls from 'camera-controls'

CamControls.install({ THREE: THREE })

export type CameraControlsProps = ReactThreeFiber.Overwrite<
  ReactThreeFiber.Object3DNode<CamControls, typeof CamControls>,
  {
    target?: ReactThreeFiber.Vector3
    camera?: THREE.Camera
    domElement?: HTMLElement
  }
>

export const CameraControls = React.forwardRef<CamControls, CameraControlsProps>(
  ({ camera, domElement, ...restProps }, ref) => {
    const defaultCamera = useThree(({ camera }) => camera)
    const gl = useThree(({ gl }) => gl)
    const events = useThree(({ events }) => events) as EventManager<HTMLElement>

    const explCamera = (camera || defaultCamera) as THREE.PerspectiveCamera | THREE.OrthographicCamera
    const explDomElement = domElement || (typeof events.connected !== 'boolean' ? events.connected : gl.domElement)

    const controls = React.useMemo(() => new CamControls(explCamera, explDomElement), [explCamera, explDomElement])

    useFrame(({ gl, scene, camera }, delta) => {
      if (controls.enabled) {
        const hasUpdated = controls.update(delta)
        if (hasUpdated) {
          gl.render(scene, camera)
        }
      }
    })

    return <primitive ref={ref} object={controls} {...restProps} />
  }
)
