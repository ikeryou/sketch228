import { MyDisplay } from "../core/myDisplay";
import { Tween } from "../core/tween";
import { Util } from "../libs/util";
import { OutlineData } from "./outlineData";
import { Segment } from "./segment";
import { Vector2 } from "three/src/math/Vector2";
import { Conf } from "../core/conf";

// -----------------------------------------
//
// -----------------------------------------
export class Contents extends MyDisplay {


  private _segment:Array<Segment> = [];
  private _isStart:boolean = false;

  private _loadedDataNum:number = 0;
  private _dataNum:number = 10;
  private _pointData:Array<Vector2> = [];
  private _nowPointId:number = 0;

  constructor(opt:any) {
    super(opt)

    // あらかじめ一定数作っておく
    this._makeSegment();

    // SVG読み込み
    this._loadData();

    this._resize();
  }


  private _makeSegment(): void {
    const num = Conf.instance.IS_SP ? 80 : 100; // セグメント数
    for(let i = 0; i < num; i++) {
      const el = document.createElement('div')
      el.classList.add('item')
      this.getEl().append(el);
      const item = new Segment({
        el:el,
        id:this._segment.length,
      })
      this._segment.push(item);

      // 最初は非表示
      Tween.instance.set(item.getEl(), {
        opacity:0.00001
      })
    }
  }


  private _loadData(): void {
    // 全部終わったらアニメーション開始
    if(this._loadedDataNum >= this._dataNum) {
      console.log('owari');
      console.log(this._pointData);
      this._isStart = true;
      return
    }

    const data = new OutlineData();

    const key = this._loadedDataNum;
    const src = './assets/' + key + '.svg';

    data.load(src, this._pointData, () => {
      this._loadedDataNum++;
      this._loadData();
    })
  }


  // 描画するラインをひとつ進める
  private _updateLinePos(): void {

    // 次の
    let nextId = this._nowPointId + 1;
    if(nextId >= this._pointData.length) {
      nextId = 0;
    }
    const nextData = this._pointData[nextId];

    // 今の
    const nowData = this._pointData[this._nowPointId];

    const segKey = this._nowPointId % this._segment.length;
    const seg = this._segment[segKey];
    seg.isActive = true;
    seg.setPos(nowData.x, nowData.y);

    // 傾き計算
    const dx = nextData.x - nowData.x;
    const dy = nextData.y - nowData.y;

    const radian = Math.atan2(dy, dx);
    seg.setRot(Util.instance.degree(radian));

    // 反映
    Tween.instance.set(seg.getEl(), {
      opacity:1,
      x:nowData.x,
      y:nowData.y,
      rotationZ:seg.getRot()
    });

    this._nowPointId++;
    if(this._nowPointId >= this._pointData.length) this._nowPointId = 0;
  }


  protected _update(): void {
    super._update();

    if(this._isStart) {
      for(let i = 0; i < 5; i++) {
        this._updateLinePos();
      }
    }
  }
}