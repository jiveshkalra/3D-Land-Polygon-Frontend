import * as THREE from 'three'
import * as CANNON from 'cannon-es'
class Entity{
    constructor({physics=true, geo= new THREE.BoxGeometry(1,1,1), mat= new THREE.MeshBasicMaterial, phy_geo=new CANNON.Box(), mass=0}){
        this.mesh = new THREE.Mesh(geo,mat);
        this.phyGeo = new CANNON.Body({
            shape:phy_geo,
            mass:mass
        })
    }
}

export default Entity;