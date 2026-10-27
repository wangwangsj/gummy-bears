/* shared/levels.mjs - the 21 official levels (3 chapters x 7), data only: no THREE, no DOM.
   Chapter 0 factory = the original 7 (ids and order unchanged, so old saves and positional
   legacy arrays keep working).  Chapter 1 Dessert Street and chapter 2 Candy Fair are the
   expansion: every one of them is reachable by at least one legal command (see LEVEL_SOLUTIONS,
   measured with the real simulateRun, sling 0).
   Each entry carries a stable id (saves / leaderboards / replays never depend on array order)
   plus chapter metadata (chapter / chapterName / chapterTheme / order) for the front end.
   Entries are deep-frozen: runs copy parts, never mutate these.
   part kinds: box (static / spinning), roller / bumper / saw (circles), spring, press + blade
   (slam), crusher (rolls back and forth), belt, glass, jar (breakable).  zones: box / syrup /
   grinder; goal ends the level.  stars = [two-star score, three-star score] calibrated to the
   zero-upgrade grid p50 / p90 (pipeline/level-expansion-2026-10-16.md);
   start = bear spawn [x, y]; span = x range of the factory. */
import { RULES_VERSION } from "./rules.mjs";
export { RULES_VERSION };

const RAW_LEVELS = [
  {"id":"stairway","name":{"en":"Simple Stairs","zh":"基础楼梯"},"tag":{"en":"Read the course before launch","zh":"看清路线再发射"},"goal":"box","chapter":0,"chapterName":{"en":"Candy Factory","zh":"糖果工厂"},"chapterTheme":"factory","theme":"factory","order":0,"dev":{"en":["simple-stairs"],"zh":["基础楼梯"]},"start":[-7,6.4],"stars":[3400,4550],"span":[-9,8.8],"reference":{"key":"simple-stairs","source":"https://www.youtube.com/watch?v=G__93JCDP4c","time":5.5,"scope":"thumbnail","note":"缩略图只确认空间与可见物；运动速度、相位、发射器和送达目标为本作改编。"},
    parts: [
      {"t":"box","x":-7,"y":6.15,"w":2,"h":0.5,"c":"cream"},
      {"t":"box","x":-7,"y":2.95,"w":0.6,"h":5.9,"c":"cream"},
      {"t":"box","x":-5.4,"y":2.8,"w":1.05,"h":5.6,"c":"pink","mu":0.002,"e":0.1},
      {"t":"box","x":-4.3500000000000005,"y":2.4499999999999997,"w":1.05,"h":4.9,"c":"cream","mu":0.002,"e":0.1},
      {"t":"box","x":-3.3000000000000003,"y":2.0999999999999996,"w":1.05,"h":4.2,"c":"pink","mu":0.002,"e":0.1},
      {"t":"box","x":-2.25,"y":1.75,"w":1.05,"h":3.5,"c":"cream","mu":0.002,"e":0.1},
      {"t":"box","x":-1.2000000000000002,"y":1.4,"w":1.05,"h":2.8,"c":"pink","mu":0.002,"e":0.1},
      {"t":"box","x":-0.15000000000000036,"y":1.0499999999999998,"w":1.05,"h":2.1,"c":"cream","mu":0.002,"e":0.1},
      {"t":"box","x":0.9000000000000004,"y":0.7000000000000002,"w":1.05,"h":1.4,"c":"pink","mu":0.002,"e":0.1},
      {"t":"box","x":1.9500000000000002,"y":0.3500000000000001,"w":1.05,"h":0.7,"c":"cream","mu":0.002,"e":0.1},
      {"t":"box","x":8.2,"y":1.8,"w":0.5,"h":3.6,"c":"cream"}
    ],
    zones: [{"kind":"box","goal":true,"x0":3.2,"x1":7.9,"y0":0,"y1":1.6,"pts":500}],
    collectibles: [{"x":-3.8,"y":5.5,"pts":300},{"x":-0.5,"y":3.4,"pts":300},{"x":4.7,"y":1.8,"pts":300}]
  },
  {"id":"rolling-pins","name":{"en":"Slide Down","zh":"下滑坡道"},"tag":{"en":"Read the course before launch","zh":"看清路线再发射"},"goal":"box","chapter":0,"chapterName":{"en":"Candy Factory","zh":"糖果工厂"},"chapterTheme":"factory","theme":"factory","order":1,"dev":{"en":["slide-down"],"zh":["下滑坡道"]},"start":[-7,6.8],"stars":[3100,4000],"span":[-9,9],"reference":{"key":"slide-down","source":"https://www.youtube.com/watch?v=G__93JCDP4c","time":5.5,"scope":"thumbnail","note":"缩略图只确认空间与可见物；运动速度、相位、发射器和送达目标为本作改编。"},
    parts: [
      {"t":"box","x":-7,"y":6.55,"w":2,"h":0.5,"c":"cream"},
      {"t":"box","x":-1.9500000000000002,"y":3.7,"w":9.403191,"h":0.24,"c":"butter","a":-32.845058,"mu":0.001,"e":0.08},
      {"t":"box","x":5,"y":0.45,"w":6,"h":0.9,"c":"cream","mu":0.002,"e":0.12},
      {"t":"box","x":8.4,"y":2,"w":0.5,"h":4,"c":"cream"}
    ],
    zones: [{"kind":"box","goal":true,"x0":5.3,"x1":8.1,"y0":0.9,"y1":2.5,"pts":500}],
    collectibles: [{"x":-4.1,"y":6,"pts":300},{"x":0.2,"y":3.4,"pts":300},{"x":5.4,"y":2.8,"pts":300}]
  },
  {"id":"juicer","name":{"en":"Straight Line","zh":"直线撞墙"},"tag":{"en":"Read the course before launch","zh":"看清路线再发射"},"goal":"box","chapter":0,"chapterName":{"en":"Candy Factory","zh":"糖果工厂"},"chapterTheme":"factory","theme":"factory","order":2,"dev":{"en":["straight-line"],"zh":["直线撞墙"]},"start":[-7,1],"stars":[2350,3650],"span":[-9,10],"reference":{"key":"straight-line","source":"https://www.youtube.com/watch?v=G__93JCDP4c","time":5.5,"scope":"thumbnail","note":"缩略图只确认空间与可见物；运动速度、相位、发射器和送达目标为本作改编。"},
    parts: [
      {"t":"box","x":0.04999999999999982,"y":0.5,"w":17.1,"h":1,"c":"cream","mu":0.002,"e":0.12},
      {"t":"box","x":9,"y":4,"w":0.8,"h":8,"c":"cream"},
      {"t":"crate","x":1.2,"y":1.4,"w":0.8,"h":0.8,"hp":2.5,"pts":260,"c":"butter"},
      {"t":"jar","x":3.4,"y":1.4,"w":0.6,"h":0.8,"hp":2,"pts":220,"c":"butter"}
    ],
    zones: [{"kind":"box","goal":true,"x0":6.1,"x1":8.5,"y0":1,"y1":2.5,"pts":500}],
    collectibles: [{"x":-3.8,"y":2,"pts":300},{"x":0.3,"y":2.7,"pts":300},{"x":5.2,"y":2,"pts":300}]
  },
  {"id":"pinball","name":{"en":"Rabbit's Hole","zh":"深井兔子洞"},"tag":{"en":"Read the course before launch","zh":"看清路线再发射"},"goal":"box","chapter":0,"chapterName":{"en":"Candy Factory","zh":"糖果工厂"},"chapterTheme":"factory","theme":"factory","order":3,"dev":{"en":["rabbits-hole"],"zh":["深井兔子洞"]},"start":[-4.5,12],"stars":[4250,5900],"span":[-6.5,3.4],"reference":{"key":"rabbits-hole","source":"https://www.youtube.com/watch?v=35RW4teujvg","time":620,"scope":"dynamic","thumbnail":{"source":"https://www.youtube.com/watch?v=G__93JCDP4c","time":5.5},"samples":[620,625,627],"note":"实录620秒可见两墙深井与交错固定小凸台，625秒角色停在右侧凸台，627秒结算。只确认竖直下落/碰台/停台的接触逻辑；不声称原作有井底送达目标，坐标/缩尺/软体/目标为本作改编。"},
    parts: [
      {"t":"box","x":-4.5,"y":6,"w":1.4,"h":12,"c":"cream"},
      {"t":"box","x":1.5,"y":6,"w":1.4,"h":12,"c":"cream"},
      {"t":"box","x":-3.45,"y":10,"w":0.7,"h":0.24,"c":"pink","mu":0.002,"e":0.14},
      {"t":"box","x":0.45,"y":8.55,"w":0.7,"h":0.24,"c":"pink","mu":0.002,"e":0.14},
      {"t":"box","x":-3.45,"y":7.1,"w":0.7,"h":0.24,"c":"pink","mu":0.002,"e":0.14},
      {"t":"box","x":0.45,"y":5.65,"w":0.7,"h":0.24,"c":"pink","mu":0.002,"e":0.14},
      {"t":"box","x":-3.45,"y":4.2,"w":0.7,"h":0.24,"c":"pink","mu":0.002,"e":0.14},
      {"t":"box","x":0.45,"y":2.75,"w":0.7,"h":0.24,"c":"pink","mu":0.002,"e":0.14}
    ],
    zones: [{"kind":"box","goal":true,"x0":-3.7,"x1":0.7,"y0":0,"y1":1.7,"pts":500}],
    collectibles: [{"x":-1.5,"y":10.7,"pts":300},{"x":-1.5,"y":6.3,"pts":300},{"x":-1.5,"y":2.1,"pts":300}]
  },
  {"id":"steamroller","name":{"en":"Big Stairs","zh":"大落差楼梯"},"tag":{"en":"Read the course before launch","zh":"看清路线再发射"},"goal":"box","chapter":0,"chapterName":{"en":"Candy Factory","zh":"糖果工厂"},"chapterTheme":"factory","theme":"factory","order":4,"dev":{"en":["big-stairs"],"zh":["大落差楼梯"]},"start":[-7.8,11],"stars":[3300,4500],"span":[-9.8,9.8],"reference":{"key":"big-stairs","source":"https://www.youtube.com/watch?v=G__93JCDP4c","time":5.5,"scope":"thumbnail","note":"缩略图只确认空间与可见物；运动速度、相位、发射器和送达目标为本作改编。"},
    parts: [
      {"t":"box","x":-7.8,"y":10.75,"w":2,"h":0.5,"c":"cream"},
      {"t":"box","x":-7.8,"y":5.25,"w":0.6,"h":10.5,"c":"cream"},
      {"t":"box","x":-6.15,"y":5,"w":0.78,"h":10,"c":"pink","mu":0.001,"e":0.08},
      {"t":"box","x":-5.37,"y":4.475,"w":0.78,"h":8.95,"c":"cream","mu":0.001,"e":0.08},
      {"t":"box","x":-4.59,"y":3.95,"w":0.78,"h":7.9,"c":"pink","mu":0.001,"e":0.08},
      {"t":"box","x":-3.8100000000000005,"y":3.425,"w":0.78,"h":6.85,"c":"cream","mu":0.001,"e":0.08},
      {"t":"box","x":-3.0300000000000002,"y":2.9,"w":0.78,"h":5.8,"c":"pink","mu":0.001,"e":0.08},
      {"t":"box","x":-2.25,"y":2.375,"w":0.78,"h":4.75,"c":"cream","mu":0.001,"e":0.08},
      {"t":"box","x":-1.4700000000000006,"y":1.8499999999999996,"w":0.78,"h":3.7,"c":"pink","mu":0.001,"e":0.08},
      {"t":"box","x":0.14,"y":1.8,"w":2.32,"h":3.6,"c":"cream","mu":0.001,"e":0.08},
      {"t":"box","x":4.95,"y":0.3,"w":7.3,"h":0.6,"c":"cream","mu":0.002,"e":0.12},
      {"t":"box","x":9,"y":2.8,"w":0.6,"h":5.6,"c":"cream"}
    ],
    zones: [{"kind":"box","goal":true,"x0":5.7,"x1":8.6,"y0":0.6,"y1":2.2,"pts":500}],
    collectibles: [{"x":-4.5,"y":9.2,"pts":300},{"x":-0.2,"y":5,"pts":300},{"x":5.5,"y":2.2,"pts":300}]
  },
  {"id":"slicer","name":{"en":"Big Slide Down","zh":"长坡下滑"},"tag":{"en":"Read the course before launch","zh":"看清路线再发射"},"goal":"box","chapter":0,"chapterName":{"en":"Candy Factory","zh":"糖果工厂"},"chapterTheme":"factory","theme":"factory","order":5,"dev":{"en":["big-slide-down"],"zh":["长坡下滑"]},"start":[-8,10],"stars":[3950,5100],"span":[-10,11],"reference":{"key":"big-slide-down","source":"https://www.youtube.com/watch?v=G__93JCDP4c","time":5.5,"scope":"thumbnail","note":"缩略图只确认空间与可见物；运动速度、相位、发射器和送达目标为本作改编。"},
    parts: [
      {"t":"box","x":-8,"y":9.75,"w":2,"h":0.5,"c":"cream"},
      {"t":"box","x":-2.1500000000000004,"y":5.35,"w":12.549502,"h":0.24,"c":"butter","a":-40.799378,"mu":0.001,"e":0.08},
      {"t":"box","x":6.05,"y":0.5,"w":6.9,"h":1,"c":"cream","mu":0.002,"e":0.12},
      {"t":"box","x":9.9,"y":2.4,"w":0.6,"h":4.8,"c":"cream"},
      {"t":"glass","x":-2.6,"y":6.65,"w":0.16,"h":1.2,"hp":2.5,"pts":300,"c":"mint"}
    ],
    zones: [{"kind":"box","goal":true,"x0":6.9,"x1":9.5,"y0":1,"y1":2.6,"pts":500}],
    collectibles: [{"x":-4.6,"y":8.4,"pts":300},{"x":0,"y":4.8,"pts":300},{"x":7,"y":2.8,"pts":300}]
  },
  {"id":"grinder","name":{"en":"Fun Fans","zh":"交叉风扇"},"tag":{"en":"Read the course before launch","zh":"看清路线再发射"},"goal":"box","chapter":0,"chapterName":{"en":"Candy Factory","zh":"糖果工厂"},"chapterTheme":"factory","theme":"factory","order":6,"dev":{"en":["fun-fans"],"zh":["交叉风扇"]},"start":[-8,1],"stars":[1250,2100],"span":[-10,11.8],"reference":{"key":"fun-fans","source":"https://www.youtube.com/watch?v=G__93JCDP4c","time":5.5,"scope":"thumbnail","note":"缩略图只确认空间与可见物；运动速度、相位、发射器和送达目标为本作改编。"},
    parts: [
      {"t":"box","x":0.6500000000000004,"y":0.5,"w":19.7,"h":1,"c":"cream","mu":0.002,"e":0.12},
      {"t":"fan","x":-0.8,"y":2.3,"w":1.68,"h":0.2,"spin":0.8,"e":0.45,"mu":0.01,"pts":70},
      {"t":"fan","x":3,"y":2.3,"w":1.68,"h":0.2,"spin":0.8,"e":0.45,"mu":0.01,"pts":70},
      {"t":"fan","x":6.8,"y":2.3,"w":1.68,"h":0.2,"spin":0.8,"e":0.45,"mu":0.01,"pts":70},
      {"t":"box","x":11,"y":4.3,"w":0.6,"h":8.6,"c":"cream"}
    ],
    zones: [{"kind":"box","goal":true,"x0":8.4,"x1":10.6,"y0":1,"y1":2.6,"pts":500}],
    collectibles: [{"x":-4,"y":2.1,"pts":300},{"x":1.1,"y":3.4,"pts":300},{"x":7.3,"y":4,"pts":300}]
  },
  {"id":"dessert-01","name":{"en":"Let's Dance","zh":"地板起舞"},"tag":{"en":"Read the course before launch","zh":"看清路线再发射"},"goal":"box","chapter":1,"chapterName":{"en":"Dessert Street","zh":"甜品街"},"chapterTheme":"dessert","theme":"dessert","order":7,"dev":{"en":["lets-dance"],"zh":["地板起舞"]},"start":[-8,8],"stars":[3400,7600],"span":[-10,12.5],"reference":{"key":"lets-dance","source":"https://www.youtube.com/watch?v=G__93JCDP4c","time":5.5,"scope":"thumbnail","note":"缩略图只确认空间与可见物；运动速度、相位、发射器和送达目标为本作改编。"},
    parts: [
      {"t":"box","x":-8,"y":4,"w":1.4,"h":8,"c":"cream"},
      {"t":"box","x":2.0000000000000004,"y":0.4,"w":18.6,"h":0.8,"c":"cream","mu":0.002,"e":0.12},
      {"t":"piston","x":-4.7,"y":1.2,"w":0.65,"h":0.5,"dx":0,"dy":1.25,"period":2.4,"off":0,"e":0.5,"pts":100},
      {"t":"piston","x":-1.6,"y":1.2,"w":0.65,"h":0.5,"dx":0,"dy":1.25,"period":2.4,"off":0.17,"e":0.5,"pts":100},
      {"t":"piston","x":1.5,"y":1.2,"w":0.65,"h":0.5,"dx":0,"dy":1.25,"period":2.4,"off":0.34,"e":0.5,"pts":100},
      {"t":"piston","x":4.6,"y":1.2,"w":0.65,"h":0.5,"dx":0,"dy":1.25,"period":2.4,"off":0.51,"e":0.5,"pts":100},
      {"t":"piston","x":7.7,"y":1.2,"w":0.65,"h":0.5,"dx":0,"dy":1.25,"period":2.4,"off":0.68,"e":0.5,"pts":100},
      {"t":"box","x":11.8,"y":4.1,"w":0.6,"h":8.2,"c":"cream"}
    ],
    zones: [{"kind":"box","goal":true,"x0":9.2,"x1":11.4,"y0":0.8,"y1":2.4,"pts":500}],
    collectibles: [{"x":-4.5,"y":4.2,"pts":300},{"x":1.5,"y":3.7,"pts":300},{"x":8.5,"y":3,"pts":300}]
  },
  {"id":"dessert-02","name":{"en":"Monster's Jaws","zh":"深井夹颚"},"tag":{"en":"Read the course before launch","zh":"看清路线再发射"},"goal":"box","chapter":1,"chapterName":{"en":"Dessert Street","zh":"甜品街"},"chapterTheme":"dessert","theme":"dessert","order":8,"dev":{"en":["monsters-jaws"],"zh":["深井夹颚"]},"start":[-5,14],"stars":[6850,9150],"span":[-7,4.1],"reference":{"key":"monsters-jaws","source":"https://www.youtube.com/watch?v=G__93JCDP4c","time":6.5,"scope":"thumbnail","note":"缩略图只确认空间与可见物；运动速度、相位、发射器和送达目标为本作改编。"},
    parts: [
      {"t":"box","x":-5,"y":7,"w":1.4,"h":14,"c":"cream"},
      {"t":"box","x":2,"y":7,"w":1.4,"h":14,"c":"cream"},
      {"t":"piston","x":-3.85,"y":11.7,"w":0.7,"h":0.45,"dx":1.6,"dy":0,"period":2.7,"off":0,"e":0.2,"pts":120},
      {"t":"piston","x":0.85,"y":9.95,"w":0.7,"h":0.45,"dx":-1.6,"dy":0,"period":2.7,"off":0.14,"e":0.2,"pts":120},
      {"t":"piston","x":-3.85,"y":8.2,"w":0.7,"h":0.45,"dx":1.6,"dy":0,"period":2.7,"off":0.28,"e":0.2,"pts":120},
      {"t":"piston","x":0.85,"y":6.449999999999999,"w":0.7,"h":0.45,"dx":-1.6,"dy":0,"period":2.7,"off":0.42000000000000004,"e":0.2,"pts":120},
      {"t":"piston","x":-3.85,"y":4.699999999999999,"w":0.7,"h":0.45,"dx":1.6,"dy":0,"period":2.7,"off":0.56,"e":0.2,"pts":120},
      {"t":"piston","x":0.85,"y":2.9499999999999993,"w":0.7,"h":0.45,"dx":-1.6,"dy":0,"period":2.7,"off":0.7000000000000001,"e":0.2,"pts":120}
    ],
    zones: [{"kind":"box","goal":true,"x0":-4.2,"x1":1.2,"y0":0,"y1":1.65,"pts":500}],
    collectibles: [{"x":-1.5,"y":12.1,"pts":300},{"x":-1.5,"y":7.8,"pts":300},{"x":-1.5,"y":2.2,"pts":300}]
  },
  {"id":"dessert-03","name":{"en":"Pinball","zh":"竖井弹球"},"tag":{"en":"Read the course before launch","zh":"看清路线再发射"},"goal":"box","chapter":1,"chapterName":{"en":"Dessert Street","zh":"甜品街"},"chapterTheme":"dessert","theme":"dessert","order":9,"dev":{"en":["pinball"],"zh":["竖井弹球"]},"start":[-5,14],"stars":[7650,9000],"span":[-7,5.5],"reference":{"key":"pinball","source":"https://www.youtube.com/watch?v=G__93JCDP4c","time":6.5,"scope":"thumbnail","note":"缩略图确认左上宽肩台落入窄高井、交错弹球阵；弹性/相位/送达目标为本作改编。"},
    parts: [
      {"t":"box","x":-5,"y":7,"w":1.4,"h":14,"c":"cream","mu":0.002,"e":0.1},
      {"t":"box","x":-3.55,"y":6.3,"w":1.5,"h":12.6,"c":"cream","mu":0.002,"e":0.1},
      {"t":"box","x":3.5,"y":7,"w":0.8,"h":14,"c":"cream","mu":0.002,"e":0.1},
      {"t":"box","x":0.15,"y":0.3,"w":5.9,"h":0.6,"c":"cream","mu":0.002,"e":0.1},
      {"t":"bumper","x":-1.9,"y":10.9,"r":0.32,"boost":2,"e":0.8,"pts":90},
      {"t":"bumper","x":0,"y":10.9,"r":0.32,"boost":2,"e":0.8,"pts":90},
      {"t":"bumper","x":1.9,"y":10.9,"r":0.32,"boost":2,"e":0.8,"pts":90},
      {"t":"bumper","x":-1.7,"y":8.8,"r":0.32,"boost":2,"e":0.8,"pts":90},
      {"t":"bumper","x":0.2,"y":8.8,"r":0.32,"boost":2,"e":0.8,"pts":90},
      {"t":"bumper","x":2.1,"y":8.8,"r":0.32,"boost":2,"e":0.8,"pts":90},
      {"t":"bumper","x":-1.9,"y":6.7,"r":0.32,"boost":2,"e":0.8,"pts":90},
      {"t":"bumper","x":0,"y":6.7,"r":0.32,"boost":2,"e":0.8,"pts":90},
      {"t":"bumper","x":1.9,"y":6.7,"r":0.32,"boost":2,"e":0.8,"pts":90},
      {"t":"bumper","x":-1.7,"y":4.6,"r":0.32,"boost":2,"e":0.8,"pts":90},
      {"t":"bumper","x":0.2,"y":4.6,"r":0.32,"boost":2,"e":0.8,"pts":90},
      {"t":"bumper","x":2.1,"y":4.6,"r":0.32,"boost":2,"e":0.8,"pts":90},
      {"t":"bumper","x":-1.9,"y":2.5,"r":0.32,"boost":2,"e":0.8,"pts":90},
      {"t":"bumper","x":0,"y":2.5,"r":0.32,"boost":2,"e":0.8,"pts":90},
      {"t":"bumper","x":1.9,"y":2.5,"r":0.32,"boost":2,"e":0.8,"pts":90}
    ],
    zones: [{"kind":"box","goal":true,"x0":-2.7,"x1":3,"y0":0.6,"y1":2,"pts":500}],
    collectibles: [{"x":-0.9,"y":12.6,"pts":300},{"x":1,"y":7.8,"pts":300},{"x":-0.8,"y":2.1,"pts":300}]
  },
  {"id":"dessert-04","name":{"en":"Meteor Shower","zh":"陨石雨"},"tag":{"en":"Read the course before launch","zh":"看清路线再发射"},"goal":"box","chapter":1,"chapterName":{"en":"Dessert Street","zh":"甜品街"},"chapterTheme":"dessert","theme":"dessert","order":10,"dev":{"en":["meteor-shower"],"zh":["陨石雨"]},"start":[-8,1.8],"stars":[1700,3700],"span":[-10,12],"reference":{"key":"meteor-shower","source":"https://www.youtube.com/watch?v=G__93JCDP4c","time":7.5,"scope":"thumbnail","note":"缩略图只确认空间与可见物；运动速度、相位、发射器和送达目标为本作改编。"},
    parts: [
      {"t":"box","x":-8,"y":1.55,"w":2,"h":0.5,"c":"cream"},
      {"t":"box","x":0.7999999999999998,"y":0.3,"w":19.6,"h":0.6,"c":"cream","mu":0.002,"e":0.12},
      {"t":"meteor","x":-3.2,"y":9,"r":0.35,"fall":7.99,"drift":0.2,"period":2.8,"off":0,"e":0.3,"pts":100},
      {"t":"meteor","x":-0.8,"y":9.5,"r":0.35,"fall":8.49,"drift":0.2,"period":2.92,"off":0.18,"e":0.3,"pts":100},
      {"t":"meteor","x":1.6,"y":10,"r":0.35,"fall":8.99,"drift":0.2,"period":3.04,"off":0.36,"e":0.3,"pts":100},
      {"t":"meteor","x":4,"y":10.5,"r":0.35,"fall":9.49,"drift":0.2,"period":3.1599999999999997,"off":0.54,"e":0.3,"pts":100},
      {"t":"meteor","x":6.4,"y":11,"r":0.35,"fall":9.99,"drift":0.2,"period":3.28,"off":0.72,"e":0.3,"pts":100},
      {"t":"box","x":11,"y":4,"w":0.6,"h":8,"c":"cream"}
    ],
    zones: [{"kind":"box","goal":true,"x0":8.2,"x1":10.6,"y0":0.6,"y1":2.2,"pts":500}],
    collectibles: [{"x":-4,"y":2.2,"pts":300},{"x":2.8,"y":3,"pts":300},{"x":7.6,"y":2.1,"pts":300}]
  },
  {"id":"dessert-05","name":{"en":"Pendulums vs Fans","zh":"摆锤与风扇"},"tag":{"en":"Read the course before launch","zh":"看清路线再发射"},"goal":"box","chapter":1,"chapterName":{"en":"Dessert Street","zh":"甜品街"},"chapterTheme":"dessert","theme":"dessert","order":11,"dev":{"en":["pendulums-vs-fans"],"zh":["摆锤与风扇"]},"start":[-8,7],"stars":[2100,3850],"span":[-10,11],"reference":{"key":"pendulums-vs-fans","source":"https://www.youtube.com/watch?v=G__93JCDP4c","time":7.5,"scope":"thumbnail","note":"缩略图只确认空间与可见物；运动速度、相位、发射器和送达目标为本作改编。"},
    parts: [
      {"t":"box","x":-4.2,"y":3.5,"w":9.6,"h":7,"c":"cream","mu":0.001,"e":0.08},
      {"t":"pendulum","x":-5.7,"y":10.7,"len":2.8,"r":0.35,"amp":24,"period":3.2,"off":0,"e":0.35,"pts":100},
      {"t":"pendulum","x":-2.9,"y":10.7,"len":2.8,"r":0.35,"amp":24,"period":3.2,"off":0.33,"e":0.35,"pts":100},
      {"t":"pendulum","x":-0.1,"y":10.7,"len":2.8,"r":0.35,"amp":24,"period":3.2,"off":0.66,"e":0.35,"pts":100},
      {"t":"box","x":5.1499999999999995,"y":0.3,"w":9.1,"h":0.6,"c":"cream","mu":0.002,"e":0.12},
      {"t":"fan","x":3.2,"y":5.3,"w":1.6,"h":0.2,"spin":2,"e":0.45,"mu":0.01,"pts":70},
      {"t":"fan","x":5.9,"y":3.4,"w":1.6,"h":0.2,"spin":-2,"e":0.45,"mu":0.01,"pts":70},
      {"t":"fan","x":8.3,"y":1.8,"w":1.6,"h":0.2,"spin":2.4,"e":0.45,"mu":0.01,"pts":70},
      {"t":"box","x":10.2,"y":4.2,"w":0.6,"h":8.4,"c":"cream"}
    ],
    zones: [{"kind":"box","goal":true,"x0":7.1,"x1":9.8,"y0":0.6,"y1":2.2,"pts":500}],
    collectibles: [{"x":-4.2,"y":8.4,"pts":300},{"x":2.8,"y":7.3,"pts":300},{"x":7.1,"y":3,"pts":300}]
  },
  {"id":"dessert-06","name":{"en":"Arrows Shower","zh":"箭雨空场"},"tag":{"en":"Read the course before launch","zh":"看清路线再发射"},"goal":"box","chapter":1,"chapterName":{"en":"Dessert Street","zh":"甜品街"},"chapterTheme":"dessert","theme":"dessert","order":12,"dev":{"en":["arrows-shower"],"zh":["箭雨空场"]},"start":[-7,2.1],"stars":[2300,2950],"span":[-9,11.2],"reference":{"key":"arrows-shower","source":"https://www.youtube.com/watch?v=G__93JCDP4c","time":7.5,"scope":"thumbnail","note":"缩略图只确认空间与可见物；运动速度、相位、发射器和送达目标为本作改编。"},
    parts: [
      {"t":"box","x":-4.8,"y":0.9,"w":6.6,"h":1.8,"c":"cream","mu":0.002,"e":0.08},
      {"t":"box","x":-1.15,"y":2,"w":0.806226,"h":0.24,"c":"butter","a":29.744881,"mu":0.001,"e":0.08},
      {"t":"arrow","x":9,"y":3.5,"w":0.7,"h":0.12,"dx":-7,"dy":-1,"period":1.6,"off":0,"cut":true,"ghost":true,"pts":160},
      {"t":"arrow","x":9,"y":5.5,"w":0.7,"h":0.12,"dx":-7,"dy":-1,"period":1.6,"off":0.23,"cut":true,"ghost":true,"pts":160},
      {"t":"arrow","x":9,"y":7.5,"w":0.7,"h":0.12,"dx":-7,"dy":-1,"period":1.6,"off":0.46,"cut":true,"ghost":true,"pts":160},
      {"t":"arrow","x":9,"y":9.5,"w":0.7,"h":0.12,"dx":-7,"dy":-1,"period":1.6,"off":0.6900000000000001,"cut":true,"ghost":true,"pts":160},
      {"t":"crate","x":0.5,"y":0.4,"w":0.8,"h":0.8,"hp":2.5,"pts":260,"c":"butter"}
    ],
    zones: [{"kind":"box","goal":true,"x0":7.5,"x1":10.5,"y0":0,"y1":1.6,"pts":500}],
    collectibles: [{"x":-3,"y":3.5,"pts":300},{"x":2.6,"y":3.8,"pts":300},{"x":6.7,"y":2,"pts":300}]
  },
  {"id":"dessert-07","name":{"en":"Saws","zh":"井壁圆锯"},"tag":{"en":"Read the course before launch","zh":"看清路线再发射"},"goal":"box","chapter":1,"chapterName":{"en":"Dessert Street","zh":"甜品街"},"chapterTheme":"dessert","theme":"dessert","order":13,"dev":{"en":["saws"],"zh":["井壁圆锯"]},"start":[-4.5,12],"stars":[5350,8200],"span":[-6.5,3.4],"reference":{"key":"saws","source":"https://www.youtube.com/watch?v=G__93JCDP4c","time":7.5,"scope":"thumbnail","note":"缩略图只确认空间与可见物；运动速度、相位、发射器和送达目标为本作改编。"},
    parts: [
      {"t":"box","x":-4.5,"y":6,"w":1.4,"h":12,"c":"cream"},
      {"t":"box","x":1.5,"y":6,"w":1.4,"h":12,"c":"cream"},
      {"t":"saw","x":-3.42,"y":10.6,"r":0.3,"spin":16,"cut":true,"ghost":true,"pts":160},
      {"t":"saw","x":0.42,"y":8.95,"r":0.3,"spin":16,"cut":true,"ghost":true,"pts":160},
      {"t":"saw","x":-3.42,"y":7.3,"r":0.3,"spin":16,"cut":true,"ghost":true,"pts":160},
      {"t":"saw","x":0.42,"y":5.65,"r":0.3,"spin":16,"cut":true,"ghost":true,"pts":160},
      {"t":"saw","x":-3.42,"y":4,"r":0.3,"spin":16,"cut":true,"ghost":true,"pts":160},
      {"t":"saw","x":0.42,"y":2.3499999999999996,"r":0.3,"spin":16,"cut":true,"ghost":true,"pts":160}
    ],
    zones: [{"kind":"box","goal":true,"x0":-3.7,"x1":0.7,"y0":0,"y1":1.7,"pts":500}],
    collectibles: [{"x":-1.5,"y":11,"pts":300},{"x":-1.5,"y":6.1,"pts":300},{"x":-1.5,"y":2.1,"pts":300}]
  },
  {"id":"fair-01","name":{"en":"Choose Your Path","zh":"上下选路"},"tag":{"en":"Read the course before launch","zh":"看清路线再发射"},"goal":"box","chapter":2,"chapterName":{"en":"Candy Fair","zh":"糖果游乐园"},"chapterTheme":"fair","theme":"fair","order":14,"dev":{"en":["choose-your-path"],"zh":["上下选路"]},"start":[-8,10.5],"stars":[5100,6600],"span":[-10,12],"reference":{"key":"choose-your-path","source":"https://www.youtube.com/watch?v=G__93JCDP4c","time":7.5,"scope":"thumbnail","note":"缩略图只确认空间与可见物；运动速度、相位、发射器和送达目标为本作改编。"},
    parts: [
      {"t":"box","x":-8,"y":5.25,"w":1.2,"h":10.5,"c":"cream"},
      {"t":"box","x":-3.3,"y":4.5,"w":0.6,"h":5.2,"c":"cream"},
      {"t":"box","x":1.5,"y":7.3,"w":10.2,"h":0.4,"c":"cream","mu":0.001,"e":0.1},
      {"t":"box","x":-0.1,"y":0.4,"w":13.8,"h":0.8,"c":"cream","mu":0.001,"e":0.1},
      {"t":"box","x":8.8,"y":1.7,"w":4,"h":3.4,"c":"cream","mu":0.001,"e":0.1},
      {"t":"fan","x":-0.6,"y":9.2,"w":1.8,"h":0.2,"spin":1.8,"e":0.45,"mu":0.01,"pts":70},
      {"t":"fan","x":3.2,"y":9.2,"w":1.8,"h":0.2,"spin":-2,"e":0.45,"mu":0.01,"pts":70},
      {"t":"saw","x":7.5,"y":3.74,"r":0.3,"spin":16,"cut":true,"ghost":true,"pts":160},
      {"t":"saw","x":9,"y":3.74,"r":0.3,"spin":16,"cut":true,"ghost":true,"pts":160},
      {"t":"crate","x":4.2,"y":1.2,"w":0.8,"h":0.8,"hp":2.5,"pts":260,"c":"butter"}
    ],
    zones: [{"kind":"box","goal":true,"x0":7.2,"x1":10.6,"y0":3.4,"y1":4.9,"pts":500}],
    collectibles: [{"x":-4.9,"y":9.2,"pts":300},{"x":1.8,"y":8.5,"pts":300},{"x":4.8,"y":2.4,"pts":300}]
  },
  {"id":"fair-02","name":{"en":"Zigzag","zh":"三层折返"},"tag":{"en":"Read the course before launch","zh":"看清路线再发射"},"goal":"box","chapter":2,"chapterName":{"en":"Candy Fair","zh":"糖果游乐园"},"chapterTheme":"fair","theme":"fair","order":15,"dev":{"en":["zigzag"],"zh":["三层折返"]},"start":[-7.2,11],"stars":[3850,5100],"span":[-10,9],"reference":{"key":"zigzag","source":"https://www.youtube.com/watch?v=G__93JCDP4c","time":7.5,"scope":"thumbnail","note":"缩略图只确认空间与可见物；运动速度、相位、发射器和送达目标为本作改编。"},
    parts: [
      {"t":"box","x":-7.2,"y":10.75,"w":2,"h":0.5,"c":"cream"},
      {"t":"box","x":-6.4,"y":2.95,"w":0.6,"h":5.9,"c":"cream"},
      {"t":"box","x":-3.5,"y":9.4,"w":9,"h":0.35,"c":"butter","a":-6,"mu":0.001,"e":0.07},
      {"t":"box","x":2,"y":5.1,"w":10,"h":0.35,"c":"pink","a":6,"mu":0.001,"e":0.07},
      {"t":"box","x":0.75,"y":0.8,"w":13.503333,"h":0.24,"c":"butter","a":-1.27303,"mu":0.001,"e":0.08},
      {"t":"box","x":8,"y":5.5,"w":0.6,"h":11,"c":"cream"},
      {"t":"fan","x":-4.6,"y":6.8,"w":1.5,"h":0.2,"spin":2,"e":0.45,"mu":0.01,"pts":70},
      {"t":"pendulum","x":5.3,"y":11.9,"len":2,"r":0.35,"amp":24,"period":3.2,"off":0,"e":0.35,"pts":100}
    ],
    zones: [{"kind":"box","goal":true,"x0":5.2,"x1":7.6,"y0":0.4,"y1":2.1,"pts":500}],
    collectibles: [{"x":-1.5,"y":10.4,"pts":300},{"x":2,"y":6.4,"pts":300},{"x":-3.8,"y":2.7,"pts":300}]
  },
  {
    "id": "fair-03",
    "name": {
      "en": "3 Holes",
      "zh": "长平台三缺口"
    },
    "tag": {
      "en": "Read the course before launch",
      "zh": "看清路线再发射"
    },
    "goal": "box",
    "chapter": 2,
    "chapterName": {
      "en": "Candy Fair",
      "zh": "糖果游乐园"
    },
    "chapterTheme": "fair",
    "theme": "fair",
    "order": 16,
    "dev": {
      "en": [
        "3-holes"
      ],
      "zh": [
        "长平台三缺口"
      ]
    },
    "start": [
      -7.5,
      2.4
    ],
    "stars": [
      1850,
      2700
    ],
    "span": [
      -10,
      11.5
    ],
    "reference": {
      "key": "3-holes",
      "source": "https://www.youtube.com/watch?v=G__93JCDP4c",
      "time": 7.5,
      "scope": "thumbnail",
      "note": "缩略图只确认空间与可见物；运动速度、相位、发射器和送达目标为本作改编。"
    },
    "parts": [
      {
        "t": "box",
        "x": -5.8625,
        "y": 1.2,
        "w": 5.275,
        "h": 2.4,
        "c": "cream",
        "mu": 0.001,
        "e": 0.08
      },
      {
        "t": "box",
        "x": -1.25,
        "y": 1.2,
        "w": 3.25,
        "h": 2.4,
        "c": "cream",
        "mu": 0.001,
        "e": 0.08
      },
      {
        "t": "box",
        "x": 2.35,
        "y": 1.2,
        "w": 3.25,
        "h": 2.4,
        "c": "cream",
        "mu": 0.001,
        "e": 0.08
      },
      {
        "t": "box",
        "x": 6.9625,
        "y": 1.2,
        "w": 5.2749999999999995,
        "h": 2.4,
        "c": "cream",
        "mu": 0.001,
        "e": 0.08
      },
      {
        "t": "box",
        "x": 10.2,
        "y": 3.7,
        "w": 0.8,
        "h": 7.4,
        "c": "cream"
      },
      {
        "t": "jar",
        "x": 5.4,
        "y": 2.8,
        "w": 0.6,
        "h": 0.8,
        "hp": 2,
        "pts": 220,
        "c": "butter"
      }
    ],
    "zones": [
      {
        "kind": "box",
        "goal": true,
        "x0": 7.2,
        "x1": 9.6,
        "y0": 2.4,
        "y1": 4,
        "pts": 500
      }
    ],
    "collectibles": [
      {
        "x": -3.05,
        "y": 3.6,
        "pts": 300
      },
      {
        "x": 0.55,
        "y": 3.6,
        "pts": 300
      },
      {
        "x": 4.15,
        "y": 3.6,
        "pts": 300
      }
    ]
  },
  {"id":"fair-04","name":{"en":"Stairs and Holes","zh":"楼梯与空腔"},"tag":{"en":"Read the course before launch","zh":"看清路线再发射"},"goal":"box","chapter":2,"chapterName":{"en":"Candy Fair","zh":"糖果游乐园"},"chapterTheme":"fair","theme":"fair","order":17,"dev":{"en":["stairs-and-holes"],"zh":["楼梯与空腔"]},"start":[-8,11],"stars":[4050,5300],"span":[-10,11.5],"reference":{"key":"stairs-and-holes","source":"https://www.youtube.com/watch?v=G__93JCDP4c","time":7.5,"scope":"thumbnail","note":"缩略图只确认空间与可见物；运动速度、相位、发射器和送达目标为本作改编。"},
    parts: [
      {"t":"box","x":-8,"y":10.75,"w":2,"h":0.5,"c":"cream"},
      {"t":"box","x":-6.8,"y":5.05,"w":1.2,"h":10.1,"c":"cream","mu":0.001,"e":0.08},
      {"t":"box","x":-3.8,"y":3.55,"w":1.1,"h":7.1,"c":"cream","mu":0.001,"e":0.08},
      {"t":"box","x":-0.3,"y":2.15,"w":1.1,"h":4.3,"c":"cream","mu":0.001,"e":0.08},
      {"t":"box","x":3.5,"y":0.85,"w":1.1,"h":1.7,"c":"cream","mu":0.001,"e":0.08},
      {"t":"box","x":-5.15,"y":7.65,"w":2.1,"h":0.35,"c":"cream","mu":0.001},
      {"t":"box","x":-1.75,"y":4.85,"w":2.1,"h":0.35,"c":"cream","mu":0.001},
      {"t":"box","x":1.6,"y":2.25,"w":2.5,"h":0.35,"c":"cream","mu":0.001},
      {"t":"box","x":-4.68,"y":8.525,"w":3.735149,"h":0.24,"c":"butter","a":-41.689058,"mu":0.001,"e":0.08},
      {"t":"box","x":-1.5499999999999998,"y":5.925,"w":4.301123,"h":0.24,"c":"butter","a":-38.157227,"mu":0.001,"e":0.08},
      {"t":"box","x":3.15,"y":2.65,"w":6.867833999999999,"h":0.24,"c":"butter","a":-32.784281,"mu":0.001,"e":0.08},
      {"t":"box","x":8,"y":0.3,"w":3.8000000000000007,"h":0.6,"c":"cream","mu":0.002,"e":0.12},
      {"t":"box","x":10.3,"y":2.2,"w":0.6,"h":4.4,"c":"cream"}
    ],
    zones: [{"kind":"box","goal":true,"x0":7.2,"x1":9.9,"y0":0.6,"y1":2.2,"pts":500}],
    collectibles: [{"x":-4.8,"y":9.5,"pts":300},{"x":-0.8,"y":6,"pts":300},{"x":4.8,"y":2.8,"pts":300}]
  },
  {"id":"fair-05","name":{"en":"Roller Coaster","zh":"过山车压线"},"tag":{"en":"Perfect timing","zh":"卡准三拍"},"goal":"box","chapter":2,"chapterName":{"en":"Candy Fair","zh":"糖果游乐园"},"chapterTheme":"fair","theme":"fair","order":18,"dev":{"en":["belt","three presses"],"zh":["传送带","三台冲压"]},"start":[-7.8,6.2],"stars":[10600,13550],"span":[-9.4,12.4],"adaptation":true,"adaptationOf":"legacy-gummy-bears",
    parts: [
      {"t":"box","x":-7.8,"y":5.95,"w":2,"h":0.5,"c":"cream"},
      {"t":"box","x":-3.65,"y":3.1500000000000004,"w":7.887332,"h":0.24,"c":"butter","a":-39.340518,"mu":0.001,"e":0.08},
      {"t":"belt","x":2.75,"y":0.25,"w":6.699999999999999,"h":0.5,"belt":2.4},
      {"t":"press","x":0.3,"y":3.1,"w":1.6,"h":1,"amp":2,"period":1.8,"off":0,"pts":300,"soft":0.75},
      {"t":"press","x":2.5,"y":3.1,"w":1.6,"h":1,"amp":2,"period":1.5,"off":0.33,"pts":300,"soft":0.75},
      {"t":"press","x":4.7,"y":3.1,"w":1.6,"h":1,"amp":2,"period":1.2,"off":0.66,"pts":300,"soft":0.75},
      {"t":"box","x":10.8,"y":0.6,"w":0.25,"h":1.2,"c":"metal"},
      {"t":"box","x":12,"y":2.6,"w":0.6,"h":5.2,"c":"pink"},
      {"t":"box","x":8.399999999999999,"y":0.325,"w":3.5999999999999996,"h":0.65,"c":"butter"}
    ],
    zones: [{"kind":"box","goal":true,"x0":6.6,"x1":10.2,"y0":0.65,"y1":2.25,"pts":500}],
    collectibles: [{"x":-1.6,"y":2.4,"pts":300},{"x":1.6,"y":2.4,"pts":300},{"x":4.4,"y":2.4,"pts":300}]
  },
  {"id":"fair-06","name":{"en":"Candy Tower","zh":"糖塔"},"tag":{"en":"Pull to full power and lob it onto the top","zh":"拉满力度，抛高落在塔顶"},"goal":"box","chapter":2,"chapterName":{"en":"Candy Fair","zh":"糖果游乐园"},"chapterTheme":"fair","theme":"fair","order":19,"dev":{"en":["tower top","bumper","saw"],"zh":["塔顶","弹珠","圆锯"]},"start":[-7.2,4.6],"stars":[2300,3350],"span":[-9,7.3],"adaptation":true,"adaptationOf":"legacy-gummy-bears",
    parts: [
      {"t":"box","x":-7.2,"y":4.35,"w":2,"h":0.5,"c":"cream"},
      {"t":"box","x":-7.2,"y":2.05,"w":0.6,"h":4.1,"c":"lilac"},
      {"t":"box","x":1.2,"y":1.5,"w":2.6,"h":3,"c":"lilac"},
      {"t":"box","x":0,"y":3.3,"w":0.2,"h":0.6,"c":"pink"},
      {"t":"box","x":2.4,"y":3.3,"w":0.2,"h":0.6,"c":"pink"},
      {"t":"box","x":6.7,"y":3.2,"w":0.5,"h":6.4,"c":"mint"},
      {"t":"bumper","x":4.7,"y":5.2,"r":0.48,"boost":5,"pts":100},
      {"t":"saw","x":4.1,"y":0.45,"r":0.45,"spin":-16,"cut":true,"ghost":true,"pts":200},
      {"t":"glass","x":-2.5,"y":4.6,"w":0.18,"h":1.6,"c":"mint","hp":3,"pts":350}
    ],
    zones: [{"kind":"box","goal":true,"x0":0.1,"x1":2.3,"y0":3,"y1":4.6,"pts":500}],
    collectibles: [{"x":-4.2,"y":6.2,"pts":300},{"x":1.2,"y":6.2,"pts":300},{"x":4.7,"y":6.4,"pts":300}]
  },
  {"id":"fair-07","name":{"en":"Grand Carousel","zh":"终极旋转木马"},"tag":{"en":"Grand finale","zh":"游乐园终章"},"goal":"grinder","chapter":2,"chapterName":{"en":"Candy Fair","zh":"糖果游乐园"},"chapterTheme":"fair","theme":"fair","order":20,"dev":{"en":["belt","crusher","grinder"],"zh":["传送带","压路机","碎糖机"]},"start":[-8.4,6.8],"stars":[6900,7950],"span":[-10,15.1],"adaptation":true,"adaptationOf":"legacy-gummy-bears",
    parts: [
      {"t":"box","x":-8.4,"y":6.55,"w":1.8,"h":0.5,"c":"cream"},
      {"t":"box","x":-8.4,"y":3.15,"w":0.6,"h":6.3,"c":"lilac"},
      {"t":"box","x":-6.8,"y":3.25,"w":1.25,"h":6.5,"c":"pink"},
      {"t":"box","x":-5.55,"y":2.6,"w":1.25,"h":5.2,"c":"cream"},
      {"t":"box","x":-4.3,"y":1.95,"w":1.25,"h":3.9,"c":"pink"},
      {"t":"box","x":-3.05,"y":1.3,"w":1.25,"h":2.6,"c":"cream"},
      {"t":"box","x":-1.8,"y":0.65,"w":1.25,"h":1.3,"c":"pink"},
      {"t":"belt","x":2.7125,"y":0.25,"w":7.7749999999999995,"h":0.5,"belt":3},
      {"t":"saw","x":0.8,"y":1.35,"r":0.42,"spin":16,"cut":true,"ghost":true,"pts":200},
      {"t":"crusher","x":4.2,"y":1.52,"r":0.62,"amp":1.2,"period":2.2,"off":0,"pts":350,"soft":0.6},
      {"t":"saw","x":6.6,"y":1.1,"r":0.45,"spin":-22,"cut":true,"ghost":true,"pts":0,"kind":"grind"},
      {"t":"saw","x":9.7,"y":1.1,"r":0.45,"spin":22,"cut":true,"ghost":true,"pts":0,"kind":"grind"},
      {"t":"box","x":10.9,"y":0.6,"w":0.25,"h":1.2,"c":"metal"},
      {"t":"box","x":13.5,"y":1.6,"w":0.25,"h":3.2,"c":"metal"},
      {"t":"box","x":14.75,"y":3.4,"w":0.6,"h":6.8,"c":"pink"},
      {"t":"box","x":8.45,"y":0.275,"w":2.9000000000000004,"h":0.55,"c":"butter"}
    ],
    zones: [{"kind":"grinder","goal":true,"x0":7,"x1":9.9,"y0":0.55,"y1":2.1500000000000004,"pts":800}],
    collectibles: [{"x":-4,"y":6.2,"pts":300},{"x":1.2,"y":2.9,"pts":300},{"x":5.2,"y":2.4,"pts":300}]
  }
];

const deepFreeze = (o) => { if (o && typeof o === "object" && !Object.isFrozen(o)) { Object.freeze(o); for (const v of Object.values(o)) deepFreeze(v); } return o; };

export const OFFICIAL_LEVELS = Object.freeze(RAW_LEVELS.map((lv) => deepFreeze({ ...lv })));
export const levelById = (id) => OFFICIAL_LEVELS.find((l) => l.id === id) || null;
export const levelIndex = (id) => OFFICIAL_LEVELS.findIndex((l) => l.id === id);

/* the three chapters, in order.  chapter is zero-based (0 factory / 1 dessert / 2 fair) and
   the front end groups by floor(index / 7); CHAPTERS is the same metadata without the levels. */
export const CHAPTERS = Object.freeze([
  { chapter: 0, chapterName: { en: "Candy Factory", zh: "糖果工厂" }, chapterTheme: "factory", theme: "factory" },
  { chapter: 1, chapterName: { en: "Dessert Street", zh: "甜品街" }, chapterTheme: "dessert", theme: "dessert" },
  { chapter: 2, chapterName: { en: "Candy Fair", zh: "糖果游乐园" }, chapterTheme: "fair", theme: "fair" },
].map(deepFreeze));
export const levelsOfChapter = (n) => OFFICIAL_LEVELS.filter((l) => l.chapter === n);

/* one verified, repeatable delivery command per level (measured with the real simulateRun at
   sling 0).  The browser sweep can replay these instead of searching offline.  Every entry
   scores at least one star, so no level is unpassable. */
export const LEVEL_SOLUTIONS = Object.freeze(deepFreeze({
  "stairway": {
    "seed": 1,
    "vx": 12,
    "vy": 0,
    "degree": 0,
    "power": 0.8,
    "score": 2814,
    "stars": 1
  },
  "rolling-pins": {
    "seed": 1,
    "vx": 12,
    "vy": 0,
    "degree": 0,
    "power": 0.8,
    "score": 3615,
    "stars": 2
  },
  "juicer": {
    "seed": 1,
    "vx": 12,
    "vy": 0,
    "degree": 0,
    "power": 0.8,
    "score": 2079,
    "stars": 1
  },
  "pinball": {
    "seed": 1,
    "vx": 12,
    "vy": 0,
    "degree": 0,
    "power": 0.8,
    "score": 3704,
    "stars": 1
  },
  "steamroller": {
    "seed": 1,
    "vx": 12,
    "vy": 0,
    "degree": 0,
    "power": 0.8,
    "score": 1686,
    "stars": 1
  },
  "slicer": {
    "seed": 1,
    "vx": 12,
    "vy": 0,
    "degree": 0,
    "power": 0.8,
    "score": 3677,
    "stars": 1
  },
  "grinder": {
    "seed": 1,
    "vx": 14.033510480423963,
    "vy": 2.474486531753757,
    "degree": 10,
    "power": 0.95,
    "score": 1484,
    "stars": 2
  },
  "dessert-01": {
    "seed": 1,
    "vx": 12.340862003928251,
    "vy": 7.124999999999999,
    "degree": 30,
    "power": 0.95,
    "score": 2877,
    "stars": 1
  },
  "dessert-02": {
    "seed": 1,
    "vx": 12,
    "vy": 0,
    "degree": 0,
    "power": 0.8,
    "score": 9545,
    "stars": 3
  },
  "dessert-03": {
    "seed": 1,
    "vx": 12,
    "vy": 0,
    "degree": 0,
    "power": 0.8,
    "score": 9086,
    "stars": 3
  },
  "dessert-04": {
    "seed": 1,
    "vx": 12,
    "vy": 0,
    "degree": 0,
    "power": 0.8,
    "score": 2066,
    "stars": 2
  },
  "dessert-05": {
    "seed": 1,
    "vx": 11.59110991546882,
    "vy": 3.105828541230249,
    "degree": 15,
    "power": 0.8,
    "score": 2082,
    "stars": 1
  },
  "dessert-06": {
    "seed": 1,
    "vx": 12,
    "vy": 0,
    "degree": 0,
    "power": 0.8,
    "score": 1938,
    "stars": 1
  },
  "dessert-07": {
    "seed": 1,
    "vx": 12,
    "vy": 0,
    "degree": 0,
    "power": 0.8,
    "score": 7529,
    "stars": 2
  },
  "fair-01": {
    "seed": 1,
    "vx": 12.340862003928251,
    "vy": 7.124999999999999,
    "degree": 30,
    "power": 0.95,
    "score": 5230,
    "stars": 2
  },
  "fair-02": {
    "seed": 1,
    "vx": 12,
    "vy": 0,
    "degree": 0,
    "power": 0.8,
    "score": 3956,
    "stars": 2
  },
  "fair-03": {
    "seed": 1,
    "vx": 12.340862003928251,
    "vy": 7.124999999999999,
    "degree": 30,
    "power": 0.95,
    "score": 2581,
    "stars": 2
  },
  "fair-04": {
    "seed": 1,
    "vx": 12,
    "vy": 0,
    "degree": 0,
    "power": 0.8,
    "score": 3320,
    "stars": 1
  },
  "fair-05": {
    "seed": 1,
    "vx": 11.892549817311727,
    "vy": 8.640443208699354,
    "degree": 36,
    "power": 0.98,
    "score": 3884,
    "stars": 1
  },
  "fair-06": {
    "seed": 1,
    "vx": 8.173464218002406,
    "vy": 11.672916631118133,
    "degree": 55,
    "power": 0.95,
    "score": 6839,
    "stars": 3
  },
  "fair-07": {
    "seed": 1,
    "vx": 12.556298850905652,
    "vy": 2.2140142652533616,
    "degree": 10,
    "power": 0.85,
    "score": 9097,
    "stars": 3
  }
}));

const PART_TYPES = new Set(["box", "roller", "bumper", "saw", "spring", "press", "blade", "crusher", "belt", "glass", "jar", "pendulum", "piston", "meteor", "arrow", "fan", "crate"]);
const ZONE_KINDS = new Set(["box", "syrup", "grinder"]);
const NUM_KEYS = ["hp", "x", "y", "w", "h", "r", "a", "spin", "e", "mu", "soft", "boost", "pts", "amp", "period", "off", "belt", "len", "dx", "dy", "fall", "drift"];
const fin = (v) => typeof v === "number" && Number.isFinite(v);
/* throws RangeError / TypeError on anything the simulation cannot run safely (custom or untrusted levels) */
export function validateLevel(lv) {
  if (!lv || typeof lv !== "object") throw new TypeError("level must be an object");
  if (!Array.isArray(lv.parts) || lv.parts.length > 200) throw new RangeError("level.parts must be an array of <= 200");
  if (!Array.isArray(lv.zones) || !lv.zones.some((z) => z && z.goal)) throw new RangeError("level.zones needs a goal zone");
  for (const k of ["start", "span", "stars"]) if (!Array.isArray(lv[k]) || lv[k].length < 2 || !lv[k].every(fin)) throw new RangeError("level." + k + " must be 2 finite numbers");
  lv.parts.forEach((P, i) => {
    if (!P || !PART_TYPES.has(P.t)) throw new RangeError("part " + i + ": unknown type");
    for (const k of NUM_KEYS) if (P[k] !== undefined && !fin(P[k])) throw new RangeError("part " + i + "." + k + " not finite");
    if (["press", "blade", "crusher", "pendulum", "piston", "meteor", "arrow"].includes(P.t) && !(P.period > 0)) throw new RangeError("part " + i + ": period must be > 0");
    if (P.t === "pendulum" && !(P.len > 0)) throw new RangeError("part " + i + ": len must be > 0");
    if (P.t === "pendulum" && (!fin(P.amp) || P.amp < 0 || P.amp > 80)) throw new RangeError("part " + i + ": pendulum amp must be 0..80 degrees");
    if (P.t === "meteor" && !(P.fall > 0)) throw new RangeError("part " + i + ": fall must be > 0");
    if (P.t === "arrow" && (!fin(P.dx) || Math.abs(P.dx) + Math.abs(P.dy || 0) < .1)) throw new RangeError("part " + i + ": arrow travel required");
    if (P.t === "fan" && !(P.w >= P.h)) throw new RangeError("part " + i + ": fan w must be >= h");
    if (["roller", "bumper", "saw", "crusher", "pendulum", "meteor"].includes(P.t) && !(P.r > 0)) throw new RangeError("part " + i + ": r must be > 0");
    if (["box", "belt", "spring", "glass", "jar", "press", "blade", "piston", "arrow", "fan", "crate"].includes(P.t) && !(P.w > 0 && P.h > 0)) throw new RangeError("part " + i + ": w/h must be > 0");
  });
  if (lv.collectibles !== undefined) {
    if (!Array.isArray(lv.collectibles) || lv.collectibles.length > 32) throw new RangeError("level.collectibles must be an array of <= 32");
    lv.collectibles.forEach((c, i) => { for (const k of ["x", "y", "pts"]) if (!fin(c && c[k])) throw new RangeError("collectible " + i + "." + k + " not finite"); });
  }
  lv.zones.forEach((Z, i) => {
    if (!Z || !ZONE_KINDS.has(Z.kind)) throw new RangeError("zone " + i + ": unknown kind");
    for (const k of ["x0", "x1", "y0", "y1", "pts"]) if (!fin(Z[k])) throw new RangeError("zone " + i + "." + k + " not finite");
  });
  return lv;
}
