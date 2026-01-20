import * as THREE from "three"

export const debugUVMapping = (mesh: THREE.Mesh) => {
  const uvAttr = mesh.geometry.attributes.uv
  if (!uvAttr) {
    return
  }

  let minU = Number.POSITIVE_INFINITY,
    maxU = Number.NEGATIVE_INFINITY,
    minV = Number.POSITIVE_INFINITY,
    maxV = Number.NEGATIVE_INFINITY

  for (let i = 0; i < uvAttr.count; i++) {
    const u = uvAttr.getX(i)
    const v = uvAttr.getY(i)
    minU = Math.min(minU, u)
    maxU = Math.max(maxU, u)
    minV = Math.min(minV, v)
    maxV = Math.max(maxV, v)
  }
}

export const debugAllObjectsUV = (scene: THREE.Object3D) => {
  if (!scene) {
    return
  }

  const sketchfabModel = scene.getObjectByName("Sketchfab_model")
  if (!sketchfabModel) {
    return
  }

  const geode = sketchfabModel.getObjectByName("Geode")
  if (!geode) {
    return
  }
}

function splitCoverEdgeSeam(geometry: THREE.BufferGeometry, coverMask: Uint8Array) {
  const pos = geometry.attributes.position
  const index = geometry.index!

  const posArr: number[] = []
  const uvArr: number[] = []
  const newIdx: number[] = []
  const vertMap = new Map<number, number>()

  for (let i = 0; i < pos.count; i++) {
    posArr.push(pos.getX(i), pos.getY(i), pos.getZ(i))
    uvArr.push(0, 0)
  }

  for (let i = 0; i < index.count; i += 3) {
    const ia = index.getX(i)
    const ib = index.getX(i + 1)
    const ic = index.getX(i + 2)

    const aCover = coverMask[ia] === 1
    const bCover = coverMask[ib] === 1
    const cCover = coverMask[ic] === 1

    const faceIsCover = aCover && bCover && cCover
    const faceIsEdge = !aCover && !bCover && !cCover

    const ids = [ia, ib, ic]

    const isMixed = !(faceIsCover || faceIsEdge)

    if (isMixed) {
      ids.forEach((id, k) => {
        const wantCoverUV = faceIsCover
        if (coverMask[id] !== +wantCoverUV) {
          let dup = vertMap.get(id)
          if (dup === undefined) {
            dup = posArr.length / 3
            vertMap.set(id, dup)
            posArr.push(pos.getX(id), pos.getY(id), pos.getZ(id))
            uvArr.push(0, 0)
          }
          ids[k] = dup
        }
      })
    }

    newIdx.push(...ids)
  }

  const g2 = new THREE.BufferGeometry()
  g2.setAttribute("position", new THREE.Float32BufferAttribute(posArr, 3))
  g2.setAttribute("uv", new THREE.Float32BufferAttribute(uvArr, 2))
  g2.setIndex(newIdx)

  return g2
}

export const generateUVForObject2 = (mesh: THREE.Mesh | null) => {
  if (!mesh) {
    return
  }

  const geometry = mesh.geometry

  if (!geometry.attributes.position) {
    return
  }

  const positions = geometry.attributes.position
  const uvArray = new Float32Array(positions.count * 2)

  geometry.computeBoundingBox()
  const bbox = geometry.boundingBox!

  let maxZ = bbox.min.z
  let minZ = bbox.max.z

  for (let i = 0; i < positions.count; i++) {
    const z = positions.getZ(i)
    maxZ = Math.max(maxZ, z)
    minZ = Math.min(minZ, z)
  }

  const zThreshold = minZ + (maxZ - minZ) * 0.8

  const width = bbox.max.x - bbox.min.x
  const height = bbox.max.y - bbox.min.y

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i)
    const y = positions.getY(i)
    const z = positions.getZ(i)

    let u = 0,
      v = 0

    if (z >= zThreshold) {
      u = (x - bbox.min.x) / width
      v = (y - bbox.min.y) / height
    }

    u = Math.max(0, Math.min(1, u))
    v = Math.max(0, Math.min(1, v))

    uvArray[i * 2] = u
    uvArray[i * 2 + 1] = v
  }

  geometry.setAttribute("uv", new THREE.BufferAttribute(uvArray, 2))
  geometry.attributes.uv.needsUpdate = true

  debugUVMapping(mesh)
}

export const generateUVForBothCovers = (mesh: THREE.Mesh | null) => {
  if (!mesh) {
    return
  }

  const geometry = mesh.geometry

  if (!geometry.attributes.position) {
    return
  }

  geometry.computeVertexNormals()

  const positions = geometry.attributes.position
  const normals = geometry.attributes.normal

  geometry.computeBoundingBox()
  const bbox = geometry.boundingBox!

  const FRONT_DOT = 0.98
  const BACK_DOT = -0.98
  const MAX_XY_DEVIATION = 0.1

  let maxZ = bbox.min.z
  let minZ = bbox.max.z

  for (let i = 0; i < positions.count; i++) {
    const z = positions.getZ(i)
    maxZ = Math.max(maxZ, z)
    minZ = Math.min(minZ, z)
  }

  const zRange = maxZ - minZ
  const frontZThreshold = maxZ - zRange * 0.05
  const backZThreshold = minZ + zRange * 0.05

  const width = bbox.max.x - bbox.min.x
  const height = bbox.max.y - bbox.min.y

  const coverMask = new Uint8Array(positions.count)

  for (let i = 0; i < positions.count; i++) {
    const nx = normals.getX(i)
    const ny = normals.getY(i)
    const nz = normals.getZ(i)
    const z = positions.getZ(i)

    const hasGoodNormal = Math.abs(nx) < MAX_XY_DEVIATION && Math.abs(ny) < MAX_XY_DEVIATION
    const isStrictlyFront = nz >= FRONT_DOT && hasGoodNormal && z >= frontZThreshold
    const isStrictlyBack = nz <= BACK_DOT && hasGoodNormal && z <= backZThreshold

    if (isStrictlyFront || isStrictlyBack) {
      coverMask[i] = 1
    } else {
      coverMask[i] = 0
    }
  }

  const newGeometry = splitCoverEdgeSeam(geometry, coverMask)

  mesh.geometry = newGeometry

  const newPositions = newGeometry.attributes.position
  const uvArray = new Float32Array(newPositions.count * 2)

  newGeometry.computeVertexNormals()
  const newNormals = newGeometry.attributes.normal

  for (let i = 0; i < newPositions.count; i++) {
    const x = newPositions.getX(i)
    const y = newPositions.getY(i)
    const z = newPositions.getZ(i)
    const nx = newNormals.getX(i)
    const ny = newNormals.getY(i)
    const nz = newNormals.getZ(i)

    let u = -10,
      v = -10

    const hasGoodNormal = Math.abs(nx) < MAX_XY_DEVIATION && Math.abs(ny) < MAX_XY_DEVIATION
    const isStrictlyFront = nz >= FRONT_DOT && hasGoodNormal && z >= frontZThreshold
    const isStrictlyBack = nz <= BACK_DOT && hasGoodNormal && z <= backZThreshold

    if (isStrictlyFront) {
      const normalizedU = (x - bbox.min.x) / width
      const normalizedV = (y - bbox.min.y) / height
      u = normalizedU * 0.5
      v = normalizedV
    } else if (isStrictlyBack) {
      const normalizedU = (x - bbox.min.x) / width
      const normalizedV = (y - bbox.min.y) / height
      u = 0.5 + normalizedU * 0.5
      v = normalizedV
    }

    uvArray[i * 2] = u
    uvArray[i * 2 + 1] = v
  }

  newGeometry.setAttribute("uv", new THREE.BufferAttribute(uvArray, 2))
  newGeometry.attributes.uv.needsUpdate = true

  debugUVMapping(mesh)
}
