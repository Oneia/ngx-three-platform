import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import {
  AmbientLight, Camera, CylinderGeometry, Object3D, PerspectiveCamera, Scene, WebGLRenderer, TextureLoader,
  RepeatWrapping, DoubleSide, MeshBasicMaterial, FaceColors, SceneUtils, ClampToEdgeWrapping, Geometry, Vector2, Mesh,
  TorusGeometry,
  MeshStandardMaterial,
} from 'three';
import { Color } from 'three';
import { Face3 } from 'three';

@Component({
  selector: 'app-three-main',
  templateUrl: './three-main.component.html',
  styleUrls: ['./three-main.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThreeMainComponent {

  protected scene: Scene;
  protected camera: Camera;
  protected renderer: WebGLRenderer;
  protected cup: Object3D;
  private logoFaceArray: number[] = [
    0, 1, 2, 3, 4, 5, 6, 7, 24, 25, 26, 27, 28, 29, 30, 31
    , 48, 49, 50, 51, 52, 53, 54, 55, 72, 73, 74, 75, 76, 77, 78, 79
    , 96, 97, 98, 99, 100, 101, 102, 103, 120, 121, 122, 123, 124, 125, 126, 127
  ];

  constructor() {
    this.createRenderer();
    this.createScene();
    this.createCamera();
    this.createLight();
    this.renderCup();
  }

  protected createScene() {
    this.scene = new Scene();
  }

  protected createCamera() {
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  }

  protected createLight() {
    const ambient = new AmbientLight(0xffffff);

    this.scene.add(ambient);
  }

  protected createRenderer() {
    this.renderer = new WebGLRenderer();
    this.updateRendererSize();
    document.body.appendChild(this.renderer.domElement);
  }

  protected updateRendererSize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  renderCup() {

    this.cup = new Object3D();
    this.cup.name = 'cup';

    /*****************************************************
     *   BODY                                            *
     *****************************************************/

    const cupBodyGeometry = new CylinderGeometry(1.27, 1, 2.4, 64, 12, true);
    const loader2 = new TextureLoader();
    loader2.crossOrigin = '*';

    // const dotsTexture = loader2.load('https://dl.dropboxusercontent.com/u/44063665/dots.png');
    // dotsTexture.wrapS = RepeatWrapping;
    // dotsTexture.wrapT = RepeatWrapping;
    // dotsTexture.repeat.set(4.0, 1.30);
    // dotsTexture.name = 'cupBodyTexture';

    const cupBodyMaterial = new MeshBasicMaterial({
      color: 0xFFFFFF,
      side: DoubleSide,
      overdraw: 0.5
    });
    cupBodyMaterial.name = 'cupBodyMaterial';

    const cupBodyMaterialTexture = new MeshBasicMaterial({
      // map: dotsTexture,
      transparent: true,
      overdraw: 1,
    });
    cupBodyMaterialTexture.name = 'cupBodyTexture';

    const cupBodyMaterials = [];

    cupBodyMaterials.push(cupBodyMaterial);
    cupBodyMaterials.push(cupBodyMaterialTexture);

    cupBodyMaterial.vertexColors = FaceColors;
    cupBodyGeometry.computeFaceNormals();

    const cupBodyMesh = SceneUtils.createMultiMaterialObject(cupBodyGeometry, cupBodyMaterials);
    cupBodyMesh.name = 'cupBody';
    this.cup.add(cupBodyMesh);

    /*****************************************************
     *   LOGO                                            *
     *****************************************************/
    const loader = new TextureLoader();
    loader.crossOrigin = '*';
    // const logoTexture =  loader.load('https://dl.dropboxusercontent.com/u/44063665/logo.png');
    //
    // logoTexture.wrapS = ClampToEdgeWrapping;
    // logoTexture.wrapT = ClampToEdgeWrapping;
    // logoTexture.repeat.set(1, 1);
    // logoTexture.name = 'logo';

    const logoMaterial = new MeshBasicMaterial({transparent: true, overdraw: 1});
    const logoGeometry = new Geometry();

    const logoGeometryData = this.generateGeometry(cupBodyGeometry, this.logoFaceArray);
    logoGeometry.faces = logoGeometryData.faces;
    logoGeometry.vertices = logoGeometryData.vertices;

    logoGeometry.computeFaceNormals();
    logoGeometry.computeVertexNormals();

    logoGeometry.computeBoundingBox();
    const max = logoGeometry.boundingBox.max,
      min = logoGeometry.boundingBox.min;

    const offsetX = (0 - min.x);
    const offsetY = (0 - min.y);
    const range = new Vector2(Math.atan(max.x / max.z) - Math.atan(min.x / min.z), max.y - min.y);

    const rangeX = range.x + 0.07;
    const rangeY = max.y - min.y;

    logoGeometry.faceVertexUvs[0] = [];
    for (let i = 0; i < logoGeometry.faces.length; i++) {

      const v1 = logoGeometry.vertices[logoGeometry.faces[i].a],
        v2 = logoGeometry.vertices[logoGeometry.faces[i].b],
        v3 = logoGeometry.vertices[logoGeometry.faces[i].c];

      logoGeometry.faceVertexUvs[0].push([
        new Vector2((Math.atan(v1.x / v1.z) + offsetX) / rangeX, (v1.y + offsetY) / rangeY),
        new Vector2((Math.atan(v2.x / v2.z) + offsetX) / rangeX, (v2.y + offsetY) / rangeY),
        new Vector2((Math.atan(v3.x / v3.z) + offsetX) / rangeX, (v3.y + offsetY) / rangeY)
      ]);
    }

    logoGeometry.uvsNeedUpdate = true;

    const logoMesh = new Mesh(logoGeometry, logoMaterial);
    // logoMesh.overdraw = 1;
    logoMesh.name = 'cupLogo';
    this.cup.add(logoMesh);


    /*****************************************************
     *   TOP                                             *
     *****************************************************/

    const cupTopGeometry = new TorusGeometry(1.29, .06, .16, 62);
    const cupTopMaterial = new MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.50,
      metalness: 0.50,
      emissive: new Color(0xC4C4C4),
      overdraw: 1
    });

    const cupTop = new Mesh(cupTopGeometry, cupTopMaterial);
    cupTop.name = 'cupTop';
    cupTop.position.set(0, 1.25, 0);
    cupTop.rotation.x = Math.PI / 2;

    this.cup.add(cupTop);

    this.camera.lookAt(this.cup.position);
    this.scene.add(this.cup);

  }

  private generateGeometry(parent, faces) {
    const returnFaces = [],
      returnVertices = [],
      cloneControl = {};
     let counter = 0;

    for (let i = 0; i < faces.length; i++) {
      let fA, fB, fC;
      const vA = parent.faces[faces[i]].a;
      const vB = parent.faces[faces[i]].b;
      const vC = parent.faces[faces[i]].c;

      if (cloneControl[vA] !== undefined) {
        fA = cloneControl[vA];
      } else {
        returnVertices.push(parent.vertices[vA]);
        cloneControl[vA] = fA = counter;
        counter++;
      }
      if (cloneControl[vB] !== undefined) {
        fB = cloneControl[vB];
      } else {
        returnVertices.push(parent.vertices[vB]);
        cloneControl[vB] = fB = counter;
        counter++;
      }
      if (cloneControl[vC] !== undefined) {
        fC = cloneControl[vC];
      } else {
        returnVertices.push(parent.vertices[vC]);
        cloneControl[vC] = fC = counter;
        counter++;
      }
      returnFaces.push(new Face3(fA, fB, fC));
    }
    return {faces: returnFaces, vertices: returnVertices};
  }

}
