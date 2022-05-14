
import { SVGLoader, SVGResult } from 'three/examples/jsm/loaders/SVGLoader';
import { Vector3 } from "three/src/math/Vector3";
import { Vector2 } from "three/src/math/Vector2";
import { CubicBezierCurve } from 'three/src/extras/curves/CubicBezierCurve';
import { CatmullRomCurve3 } from 'three/src/extras/curves/CatmullRomCurve3';
import { Func } from '../core/func';
import { Conf } from '../core/conf';


// -----------------------------------------
//
// -----------------------------------------
export class OutlineData {

  public svgSize:Vector2 = new Vector2();

  constructor() {
  }


  public load(src:string, pointData:Array<Vector2>, onLoad:any): void {
    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    const l = new SVGLoader()
    l.load(src, (data:SVGResult) => {
      this.svgSize = this._getSVGSize(data.xml)
      data.paths.forEach((val) => {
        let path:any = []
        if(val.currentPath != null && val.currentPath.curves != null) {
          const curves:Array<CubicBezierCurve> = val.currentPath.curves

          let pNum = 10
          curves.forEach((val2) => {
            const p = val2.getPoints(pNum)
            path = path.concat(p)
          })

          if(path.length > 0) {
            const v3List:Array<Vector3> = this._toVec3(path, this.svgSize)
            const curve:CatmullRomCurve3 = new CatmullRomCurve3(v3List, false);
            const kake = Conf.instance.IS_SP ? 1.5 : 2;
            // pointsデータ抽出
            curve.points.forEach((v) => {
              pointData.push(new Vector2(sw * 0.5 + v.x * kake, sh * 0.5 + v.y * -kake));
            })
            // // const kake = Conf.instance.IS_SIMPLE ? 15 : 30
            // const kake = (this._id == 0 || this._id == 26) ? 30 : 10
            // const geo = this._makeGeo(new TubeGeometry(curve, 128 * kake, width, 3, false))
            // this._geo.push(geo)
          }
        }
      })

      if(onLoad != undefined) onLoad();
    })
  }


  // ---------------------------------
  //
  // ---------------------------------
  private _getSVGSize(xml:XMLDocument):Vector2 {
    const tempEl = document.createElement('div')
    tempEl.append(xml)
    const v = tempEl.querySelector('svg')?.getAttribute('viewBox')
    if(v == undefined) {
      return new Vector2()
    } else {
      const arr = v.split(' ')
      return new Vector2(Number(arr[2]), Number(arr[3]))
    }
  }


  // ---------------------------------
  //
  // ---------------------------------
  private _toVec3(arr:Array<any>, offset:Vector2):Array<Vector3> {
    const res:Array<Vector3> = []
    arr.forEach((val) => {
      res.push(new Vector3(val.x - offset.x * 0.5, (val.y - offset.y * 0.5) * -1, 0))
    })
    return res
  }
}