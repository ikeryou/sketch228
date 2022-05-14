
import { MyDisplay } from "../core/myDisplay";
import { Tween } from "../core/tween";
import { Expo } from "gsap";
import { Rect } from "../libs/rect";
import { Point } from "../libs/point";
import { Util } from "../libs/util";
import { Func } from "../core/func";
import { Color } from 'three/src/math/Color';
import { Conf } from "../core/conf";

// -----------------------------------------
//
// -----------------------------------------
export class Segment extends MyDisplay {

  private _id:number;
  private _input:any;
  private _rot:number = 0; // 度数表記
  private _pos:Point = new Point();
  private _size:Rect = new Rect();
  private _inputType:string;
  private _noise:number = Util.instance.random(0, 1)

  public isActive:boolean = false;
  public scale:number = 1;

  constructor(opt:any) {
    super(opt)

    this._id = opt.id;
    this._c = this._id * 2;

    this._input = document.createElement('input');

    // this._inputType = Util.instance.randomArr(['range','checkbox', 'radio', 'text', 'password', 'color', 'color', 'color'])
    this._inputType = 'text'
    this._input.setAttribute('type', this._inputType);

    if(this._inputType == 'range') {
      this._input.setAttribute('min', '0');
      this._input.setAttribute('max', '100');
      this._input.setAttribute('step', '1');
    }

    if(this._inputType == 'color') {
      const col = new Color(Util.instance.random(0,1), Util.instance.random(0,1), Util.instance.random(0,1))
      this._input.value = '#' + col.getHexString();
    }

    this.getEl().append(this._input);

    // スライダー行ったり来たりさせる
    if(this._inputType == 'range') {
      this._motion(this._id * 0.05);
    }

    this._resize();
  }


  private _motion(delay:number = 0): void {
    Tween.instance.a(this._input, {
      value:[0, 100]
    }, 1, delay, Expo.easeInOut, null, null, () => {
      Tween.instance.a(this._input, {
        value:0
      }, 1, 0, Expo.easeInOut, null, null, () => {
        this._motion();
      })
    })
  }


  public setRot(val:number): void {
    this._rot = val;
  }


  public getRot(): number {
    return this._rot;
  }


  public setPos(x:number, y:number): void {
    this._pos.x = x;
    this._pos.y = y;
  }


  public getPos(): Point {
    return this._pos;
  }


  public getPin(): Point {
    const radian = Util.instance.radian(this._rot);
    const x = this._pos.x + Math.cos(radian) * this._size.width;
    const y = this._pos.y + Math.sin(radian) * this._size.width;

    return new Point(x, y);
  }


  protected _update(): void {
    super._update();

    if(!this.isActive) return

    // スケールうにょうにょさせる
    // const rad = Util.instance.radian(this._c * 20)
    // this.scale = Util.instance.map(Math.sin(rad), 0.5, 1.5, -1, 1);
    // Tween.instance.set(this._input, {
    //   scale:this.scale,
    // });

    // 一定間隔で反転
    if(this._c % 20 == 0) {
      this._input.checked = !this._input.checked;
    }

    if(this._inputType == 'text' || this._inputType == 'password') {
      const num = ~~(Util.instance.mix(5, 15, this._noise));
      this._input.value = ''
      for(let i = 0; i < num; i++) {
        this._input.value += Util.instance.randomArr('ABCDEFGHIKLMNOPRSTUVWXYZ0123456789'.split(''));
      }
    }

    if(this._inputType == 'color') {
      if(this._c % 5 == 0) {
        const col = new Color(Util.instance.random(0,1), Util.instance.random(0,1), Util.instance.random(0,1))
        this._input.value = '#' + col.getHexString();
      }
    }
  }


  protected _resize(): void {
    super._resize();

    let itemW = 15 * Util.instance.mix(1, 2, this._noise);
    let itemH = itemW;
    if(this._inputType == 'range' || this._inputType == 'text' || this._inputType == 'date') {
      itemW = Util.instance.random(40, 120);
      itemH = 20;
    }

    if(Conf.instance.IS_SP && this._inputType == 'color') {
      itemW = itemH = 15 * Util.instance.mix(1, 2, this._noise);
    }

    const scale = Func.instance.sw() < Func.instance.sh() ? 0.75 : 0.75
    this._size.width = itemW * scale;
    this._size.height = itemH * scale;

    Tween.instance.set(this._input, {
      width: this._size.width,
      height: this._size.height,
      y:-this._size.height * 0.5
    })
  }

}