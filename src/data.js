// Illustrative fixtures only. These are NOT a verified food database.
export const foods=[
{id:'oat',name:'燕麦',emoji:'🌾',color:'#eee5d3',nutrients:{energy:380,protein:13,carbs:68,fat:7,fiber:10,calcium:null,iron:null,sodium:null}},
{id:'milk',name:'牛奶',emoji:'🥛',color:'#e8ede6',nutrients:{energy:60,protein:3,carbs:5,fat:3,fiber:0,calcium:100,iron:null,sodium:null}},
{id:'rice',name:'米饭',emoji:'🍚',color:'#eee9df',nutrients:{energy:130,protein:3,carbs:28,fat:0.3,fiber:null,calcium:null,iron:null,sodium:null}},
{id:'salmon',name:'三文鱼',emoji:'🍣',color:'#f3ddd0',nutrients:{energy:200,protein:22,carbs:0,fat:12,fiber:0,calcium:null,iron:null,sodium:null}},
{id:'broccoli',name:'西兰花',emoji:'🥦',color:'#e1ead7',nutrients:{energy:35,protein:3,carbs:7,fat:0.4,fiber:3,calcium:40,iron:0.7,sodium:null}},
{id:'egg',name:'鸡蛋',emoji:'🥚',color:'#f3e8ce',nutrients:{energy:150,protein:13,carbs:1,fat:10,fiber:0,calcium:null,iron:null,sodium:null}}
];
export const demoTargets={energy:2000,protein:80,carbs:250,fat:65,fiber:25,calcium:800,iron:15,sodium:2000};
export function seed(date){return [
['oat',60,'早餐'],['milk',250,'早餐'],['egg',50,'早餐'],['rice',180,'午餐'],['salmon',120,'午餐'],['broccoli',150,'午餐']
].map(([id,grams,meal],i)=>({...structuredClone(foods.find(f=>f.id===id)),id:'demo-'+i,grams,meal,date,source:'演示数据 · 未经核实，不用于饮食决策'}));}
export const references=[
{title:'复合菜如何计算营养？',tag:'配方计算方法',org:'FAO · Food Composition Data',text:'复合菜需要分解食材，并考虑熟制重量、油水变化和营养素保留率。当前版本要求录入匹配熟制状态的食材数据，不自行编造转换系数。',url:'https://www.fao.org/4/y4705e/y4705e23.htm'},
{title:'食品成分从哪里来？',tag:'食品数据库',org:'USDA · FoodData Central',text:'公共领域的食品成分数据库。真实接入时保留食物编号、重量基准和原始来源；不同品种与烹调方式的数据不可直接混用。',url:'https://fdc.nal.usda.gov/api-guide/'},
{title:'每日目标，并非人人相同',tag:'参考摄入量',org:'NIH · Office of Dietary Supplements',text:'DRI 按年龄、性别等区分，包含 RDA、AI、EAR 和 UL。标签每日参考值不等同于个人需求；低于目标不构成营养缺乏诊断。',url:'https://ods.od.nih.gov/healthinformation/nutrientrecommendations.aspx'}
];
