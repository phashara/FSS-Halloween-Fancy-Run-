import { QuizQuestion } from '../types';

export const GHOST_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    prompt: 'เมื่อได้ยินเสียงเรียกชื่อคุณจากด้านหลังกลางดึกในซอยเปลี่ยว คุณจะทำอย่างไร?',
    options: [
      {
        text: 'ใส่เกียร์หมา สับตีนแตกวิ่งไม่คิดชีวิต!',
        description: 'สัญชาตญาณความเร็วเต็มพิกัด ไม่สนหน้าอินทร์หน้าพรหม',
        biasSpecies: ['krasue', 'krahang', 'headless'],
        statBoost: { speed: 8 },
      },
      {
        text: 'หันกลับไปจ้องตา แล้วถามว่า "มีอะไรกินไหม?"',
        description: 'ความหิวชนะความกลัว กลิ่นของกินลอยมาต้องแวะก่อน',
        biasSpecies: ['pop', 'kuman'],
        statBoost: { latentPower: 6, spookiness: 4 },
      },
      {
        text: 'หยิบโทรศัพท์ขึ้นมาเปิดไฟฉาย เดินสำรวจหาต้นตอ',
        description: 'สายส่องความจริง พกความสว่างไม่กลัวความมืด',
        biasSpecies: ['phiphong', 'pret'],
        statBoost: { stealth: 5, hauntingAura: 5 },
      },
      {
        text: 'ตั้งสติ แผ่เมตตา แล้วเดินต่อไปแบบสุภาพชน',
        description: 'สายซัพพอร์ต จิตใจสงบนิ่ง ปลอดภัยไว้ก่อน',
        biasSpecies: ['tani', 'nangram'],
        statBoost: { hauntingAura: 7, latentPower: 5 },
      },
    ],
  },
  {
    id: 2,
    prompt: 'ถ้าคุณต้องเลือกสถานที่สำหรับ "แกล้งหลอกคน" คุณจะเลือกที่ไหน?',
    options: [
      {
        text: 'กลางดงกล้วยตานี หรือใต้ต้นไม้ใหญ่ร่มรื่น',
        description: 'บรรยากาศเขียวขจี เงียบสงบแต่น่าขนลุกเบาๆ',
        biasSpecies: ['tani', 'kongkoi'],
        statBoost: { stealth: 8, latentPower: 5 },
      },
      {
        text: 'ลอยข้ามยอดไม้สูงๆ หรือโผล่บนหลังคาบ้าน',
        description: 'สายเวหา ลอยเด่นเห็นแต่ไกลให้ช็อกตาตั้ง',
        biasSpecies: ['krahang', 'krasue', 'pret'],
        statBoost: { speed: 7, spookiness: 6 },
      },
      {
        text: 'ริมท่าน้ำวัดเก่า ท่ามกลางสายหมอกจันทร์เพ็ญ',
        description: 'ความคลาสสิกสะกดสายตา ชวนให้หลงเสน่ห์ยามดึก',
        biasSpecies: ['maenak', 'nangram'],
        statBoost: { hauntingAura: 9, spookiness: 5 },
      },
      {
        text: 'แอบในห้องครัวหรือซอกตู้กับข้าว รอคนมาเปิดตู้เย็น',
        description: 'สายจู่โจมระยะประชิด ช็อกพร้อมแย่งของกิน',
        biasSpecies: ['pop', 'kuman', 'kongkoi'],
        statBoost: { latentPower: 8, speed: 4 },
      },
    ],
  },
  {
    id: 3,
    prompt: 'สไตล์การใช้ชีวิตหรือเวลาออกกำลังกาย คุณชอบแบบไหนมากที่สุด?',
    options: [
      {
        text: 'ลุยเดี่ยวแบบฉลุย เงียบกริบ ไร้ร่องรอย',
        description: 'อิสระสูงสุด คล่องตัว ไม่มีใครมาถ่วงความเร็ว',
        biasSpecies: ['krasue', 'headless', 'kongkoi', 'phi_am'],
        statBoost: { speed: 8, stealth: 6 },
      },
      {
        text: 'มีก๊วนเพื่อน เฮฮา แกล้งกัน ปาร์ตี้น้ำแดง',
        description: 'ความสนุกคือที่หนึ่ง วิ่งไปแซวไปไม่มีเหงา',
        biasSpecies: ['kuman', 'pop', 'krahang'],
        statBoost: { latentPower: 7, speed: 5 },
      },
      {
        text: 'คอยประคองคนข้างหลัง ช่วยเพื่อนร่วมทีมเข้าเส้นชัย',
        description: 'สายซัพพอร์ตตัวจริง วิ่งไม่ทิ้งใครไว้ข้างหลัง',
        biasSpecies: ['tani', 'maenak'],
        statBoost: { hauntingAura: 8, latentPower: 7 },
      },
      {
        text: 'มูฟเมนต์สวยงาม โพสท่าถ่ายรูปทุกป้ายกิโลเมตร',
        description: 'แฟชั่นนิสต้าแห่งงานวิ่ง หน้าเป๊ะ ทรงผมปังเสมอ',
        biasSpecies: ['nangram', 'pret', 'phiphong'],
        statBoost: { spookiness: 7, hauntingAura: 6 },
      },
    ],
  },
  {
    id: 4,
    prompt: 'หากคุณสามารถเลือก "พลังวิเศษ 1 อย่าง" ติดตัวไปในวันงานวิ่ง คุณจะเลือก?',
    options: [
      {
        text: 'ถอดสัมภาระเหลือแค่วิญญาณ ตัวเบาหวิว ไร้แรงต้านอากาศ',
        description: 'ลอยตัวฉิวเหมือนจรวด พุ่งผ่านโค้งแบบพริ้วไหว',
        biasSpecies: ['krasue', 'krahang'],
        statBoost: { speed: 10 },
      },
      {
        text: 'ยืดแขนได้ยาว 50 เมตร ดึงเพื่อนหรือคว้าเหรียญเข้าเส้นชัย',
        description: 'พลังสารพัดประโยชน์ ไกลแค่ไหนก็เอื้อมถึง',
        biasSpecies: ['maenak', 'pret'],
        statBoost: { latentPower: 9, hauntingAura: 5 },
      },
      {
        text: 'กระโดดสปริงบอร์ดหนึ่งที พุ่งข้ามทางลาดชันได้ 10 เมตร',
        description: 'ขาเดียวไม่หวั่น สะท้านทุกเนินเขาและทางขรุขระ',
        biasSpecies: ['kongkoi', 'headless'],
        statBoost: { speed: 8, latentPower: 6 },
      },
      {
        text: 'พลังแห่งความเมตตาและรอยยิ้ม สะกดให้ทุกคนหลีกทางให้',
        description: 'ออร่าบริสุทธิ์ ชวนให้ทุกคนเอ็นดูและส่งเสียงเชียร์',
        biasSpecies: ['tani', 'kuman', 'nangram'],
        statBoost: { hauntingAura: 8, stealth: 7 },
      },
    ],
  },
  {
    id: 5,
    prompt: 'เมื่อเพื่อนสนิทสะกิดบอกว่า "เฮ้ย... เหมือนมีใครวิ่งตามเรามาว่ะ!" คุณตอบว่า?',
    options: [
      {
        text: '"ไม่ต้องมองข้างหลัง มองไปข้างหน้าแล้วเร่งสปีดด่วน!"',
        description: 'สายกลยุทธ์ เอาตัวรอดด้วยสถิติ New PB',
        biasSpecies: ['krasue', 'krahang', 'headless'],
        statBoost: { speed: 9 },
      },
      {
        text: '"ชวนเขามากินกล้วยกับน้ำเกลือแร่ด้วยกันสิ เผื่อเขาเหนื่อย"',
        description: 'สายมิตรภาพ แบ่งปันน้ำใจแม้กระทั่งกับวิญญาณ',
        biasSpecies: ['tani', 'kuman'],
        statBoost: { latentPower: 8, hauntingAura: 5 },
      },
      {
        text: '"ถ้าวิ่งตามทัน เดี๋ยวแวะเลี้ยงหมูกระทะเลยนะ!"',
        description: 'ท้าทายด้วยของกิน ไม่มีอะไรหยุดยั้งปากได้',
        biasSpecies: ['pop', 'kuman'],
        statBoost: { spookiness: 6, latentPower: 7 },
      },
      {
        text: '"ปล่อยเขาไป... เพราะข้างหน้านี้ ยังมีข้าอีกคนที่รออยู่"',
        description: 'พูดจบพร้อมหันมายิ้มเย็นเยียบให้เพื่อนขนลุกซู่',
        biasSpecies: ['maenak', 'nangram', 'pret', 'phiphong'],
        statBoost: { spookiness: 10, hauntingAura: 8 },
      },
    ],
  },
  {
    id: 6,
    prompt: 'คุณประเมินความเร็วในการวิ่ง 5 กิโลเมตรของคุณไว้อย่างไร?',
    options: [
      {
        text: 'สายจรวดทางเรียบ ไม่เกิน 20-25 นาที ชิลๆ สบายบรื๋อ',
        description: 'ลมหายใจยังนิ่ง ขาติดสปีดตัวแม่',
        biasSpecies: ['krasue', 'krahang', 'headless', 'pret'],
        statBoost: { speed: 10 },
      },
      {
        text: 'วิ่งสลับเดิน ชมวิว ฟังเพลง ชมนกชมไม้',
        description: 'เน้นสุขภาพกายและใจ ถ่ายรูปเซลฟี่ทุกหลักกิโล',
        biasSpecies: ['tani', 'nangram'],
        statBoost: { stealth: 8, hauntingAura: 6 },
      },
      {
        text: 'วิ่งดึ๋งๆ ซิกแซก ตามอารมณ์ เจอใครก็แวะทัก',
        description: 'สไตล์คาดเดายาก แต่สนุกได้ตลอดทั้งงาน',
        biasSpecies: ['kongkoi', 'kuman'],
        statBoost: { latentPower: 8, speed: 6 },
      },
      {
        text: 'วิ่งตามกลิ่นอาหาร ถ้าจุดแจกน้ำมีของอร่อย สปีดจะพุ่ง 2 เท่า',
        description: 'ขับเคลื่อนด้วยพลังงานคาร์โบไฮเดรตและโปรตีน',
        biasSpecies: ['pop', 'phiphong'],
        statBoost: { latentPower: 9, spookiness: 5 },
      },
    ],
  },
  {
    id: 7,
    prompt: 'สถานการณ์แบบไหนในยามวิกาลที่ทำให้คุณรู้สึก "ขนลุกขนชัน" ที่สุด?',
    options: [
      {
        text: 'วิ่งคนเดียวในซอยมืด แล้วไฟข้างทางดับไล่หลังทีละดวง',
        description: 'ความมืดที่คืบคลาน บีบหัวใจให้เต้นรัว',
        biasSpecies: ['phiphong', 'krasue', 'headless'],
        statBoost: { spookiness: 8, stealth: 6 },
      },
      {
        text: 'ได้ยินเสียงดนตรีไทยแว่วมาตามสายลมยามตีสอง',
        description: 'เสียงระนาดและปี่ชวนวังเวง ขนแขนพร้อมใจกันสแตนด์อัป',
        biasSpecies: ['nangram', 'maenak'],
        statBoost: { hauntingAura: 10, spookiness: 7 },
      },
      {
        text: 'สั่งต้มเลือดหมูพิเศษตับ แต่แม่ค้าบอกว่า "ตับหมดแล้ว"',
        description: 'ฝันร้ายที่แท้จริงของคนหิว ความหลอนระดับวิกฤต',
        biasSpecies: ['pop', 'kuman'],
        statBoost: { latentPower: 8, speed: 5 },
      },
      {
        text: 'มองเงาตัวเองในกระจก แล้วเห็นเงาไม่ยอมก้มตาม',
        description: 'จิตสัมผัสความลี้ลับที่ไม่มีคำอธิบายทางวิทยาศาสตร์',
        biasSpecies: ['pret', 'kongkoi', 'headless', 'phi_am'],
        statBoost: { hauntingAura: 9, latentPower: 7 },
      },
    ],
  },
];
