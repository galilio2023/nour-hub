export interface Adhkar {
    id: string;
    title: string;
    titleAr: string;
    text: string;
    textAr: string;
    translation: string;
    whenToSay: string;
    image: string;
}

export interface Hadith {
    id: string;
    topic: string;
    text: string;
    textAr: string;
    explanation: string;
    lesson: string;
    grade: string;
    image?: string;
}

export const ADHKAR: Adhkar[] = [
    {
        id: 'morning',
        title: 'Morning Dua',
        titleAr: 'أذكار الصباح',
        text: 'Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu, wa ilaykan-nushur.',
        textAr: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
        translation: 'O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the Final Return.',
        whenToSay: 'When you wake up and start your beautiful day.',
        image: `/api/proxy-image?url=${encodeURIComponent('https://gen.pollinations.ai/image/a beautiful sunrise over a green field, morning dew, peaceful and bright, kid-friendly illustration?width=1024&height=1024&seed=101')}`
    },
    {
        id: 'evening',
        title: 'Evening Dua',
        titleAr: 'أذكار المساء',
        text: 'Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu, wa ilaykal-masir.',
        textAr: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
        translation: 'O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is the Final Return.',
        whenToSay: 'When the sun begins to set and the stars appear.',
        image: `/api/proxy-image?url=${encodeURIComponent('https://gen.pollinations.ai/image/a peaceful sunset with purple and orange sky, crescent moon, stars appearing, cozy atmosphere?width=1024&height=1024&seed=102')}`
    },
    {
        id: 'before-eating',
        title: 'Before Eating',
        titleAr: 'قبل الطعام',
        text: 'Bismillah',
        textAr: 'بِسْمِ اللَّهِ',
        translation: 'In the name of Allah.',
        whenToSay: 'Right before you take your first bite of delicious food.',
        image: `/api/proxy-image?url=${encodeURIComponent('https://gen.pollinations.ai/image/a happy child sitting at a table with healthy fruits and vegetables, smiling, bright colors?width=1024&height=1024&seed=103')}`
    },
    {
        id: 'after-eating',
        title: 'After Eating',
        titleAr: 'بعد الطعام',
        text: 'Alhamdulillahilladhi at\'amana wa saqana wa ja\'alana Muslimin.',
        textAr: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
        translation: 'Praise be to Allah who has fed us and given us drink and made us Muslims.',
        whenToSay: 'When you finish your meal and feel happy and full.',
        image: `/api/proxy-image?url=${encodeURIComponent('https://gen.pollinations.ai/image/a clean empty plate with a glass of water, a happy sun in the background, feeling grateful?width=1024&height=1024&seed=104')}`
    },
    {
        id: 'before-sleeping',
        title: 'Before Sleeping',
        titleAr: 'قبل النوم',
        text: 'Bismika Allahumma amutu wa ahya.',
        textAr: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        translation: 'In Your name, O Allah, I die and I live.',
        whenToSay: 'When you are tucked in your cozy bed, ready to dream.',
        image: `/api/proxy-image?url=${encodeURIComponent('https://gen.pollinations.ai/image/a child sleeping peacefully in a bed, moon and stars outside the window, soft blue light?width=1024&height=1024&seed=105')}`
    },
    {
        id: 'waking-up',
        title: 'Waking Up',
        titleAr: 'عند الاستيقاظ',
        text: 'Alhamdulillahilladhi ahyana ba\'da ma amatana wa ilayhin-nushur.',
        textAr: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
        translation: 'Praise be to Allah who gave us life after He had given us death, and to Him is the return.',
        whenToSay: 'As soon as you open your eyes and see the new morning.',
        image: `/api/proxy-image?url=${encodeURIComponent('https://gen.pollinations.ai/image/a child stretching and smiling in bed as sunlight filters through the window, happy start?width=1024&height=1024&seed=106')}`
    },
    {
        id: 'entering-masjid',
        title: 'Entering the Masjid',
        titleAr: 'دخول المسجد',
        text: 'Allahumma-ftah li abwaba rahmatik.',
        textAr: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
        translation: 'O Allah, open for me the doors of Your mercy.',
        whenToSay: 'When you step into the Masjid with your right foot.',
        image: `/api/proxy-image?url=${encodeURIComponent('https://gen.pollinations.ai/image/a beautiful masjid entrance with golden lights, welcoming atmosphere, soft colors?width=1024&height=1024&seed=107')}`
    },
    {
        id: 'leaving-masjid',
        title: 'Leaving the Masjid',
        titleAr: 'الخروج من المسجد',
        text: 'Allahumma inni as\'aluka min fadlik.',
        textAr: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
        translation: 'O Allah, I ask You of Your bounty.',
        whenToSay: 'When you step out of the Masjid with your left foot.',
        image: `/api/proxy-image?url=${encodeURIComponent('https://gen.pollinations.ai/image/stepping out of a masjid into a bright city street, feeling peaceful and blessed?width=1024&height=1024&seed=108')}`
    },
    {
        id: 'for-parents',
        title: 'Dua for Parents',
        titleAr: 'دعاء للوالدين',
        text: 'Rabbi-rhamhuma kama rabbayani saghira.',
        textAr: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
        translation: 'My Lord, have mercy upon them as they brought me up [when I was] small.',
        whenToSay: 'Whenever you think of your loving mom and dad.',
        image: `/api/proxy-image?url=${encodeURIComponent('https://gen.pollinations.ai/image/a child hugging parents, warm glow, heart shapes, loving and kind illustration?width=1024&height=1024&seed=109')}`
    },
    {
        id: 'entering-bathroom',
        title: 'Entering the Bathroom',
        titleAr: 'دخول الخلاء',
        text: 'Allahumma inni a\'udhu bika minal khubuthi wal khaba\'ith.',
        textAr: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
        translation: 'O Allah, I seek refuge with You from the male and female devils.',
        whenToSay: 'Before you enter the bathroom to keep the bad thoughts away.',
        image: `/api/proxy-image?url=${encodeURIComponent('https://gen.pollinations.ai/image/a clean bathroom door with a small happy cloud, friendly reminder, soft colors?width=1024&height=1024&seed=110')}`
    }
];

export const HADITHS: Hadith[] = [
    {
        id: '1',
        topic: 'Kindness',
        text: 'The most beloved of people to Allah is the one who is most helpful to people.',
        textAr: 'أَحَبُّ النَّاسِ إِلَى اللَّهِ أَنْفَعُهُمْ لِلنَّاسِ',
        explanation: 'Allah loves it when we use our hands, our time, and our smiles to help our friends, family, and even strangers!',
        lesson: 'Try to do at least one helpful thing for someone every single day.',
        grade: 'Authentic (Hasan)',
        image: `/api/proxy-image?url=${encodeURIComponent('https://gen.pollinations.ai/image/a child helping an elderly person cross the street, colorful cartoon style, warm and friendly?width=1024&height=1024&seed=201')}`
    },
    {
        id: '2',
        topic: 'Honesty',
        text: 'Verily, truthfulness leads to righteousness, and righteousness leads to Paradise.',
        textAr: 'إِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ',
        explanation: 'When we tell the truth, it makes our hearts clean and leads us to do more good things until we reach Jannah!',
        lesson: 'Always tell the truth, even if it feels a little bit scary at first.',
        grade: 'Authentic (Sahih)',
        image: `/api/proxy-image?url=${encodeURIComponent('https://gen.pollinations.ai/image/a child looking into a mirror, bright clean reflection, symbolic of honesty, soft lighting, 3d style?width=1024&height=1024&seed=202')}`
    },
    {
        id: '3',
        topic: 'Cleanliness',
        text: 'Purity is half of faith.',
        textAr: 'الطُّهُورُ شَطْرُ الإِيمَانِ',
        explanation: 'Keeping our bodies, our clothes, and our rooms clean is a big part of being a good Muslim.',
        lesson: 'Wash your hands and keep your surroundings tidy to please Allah.',
        grade: 'Authentic (Sahih)',
        image: `/api/proxy-image?url=${encodeURIComponent('https://gen.pollinations.ai/image/sparkling clean bedroom, organized toys, bright sunshine through window, kid friendly?width=1024&height=1024&seed=203')}`
    },
    {
        id: '4',
        topic: 'Good Manners',
        text: 'The best among you are those who have the best manners.',
        textAr: 'خِيَارُكُمْ أَحْسَنُكُمْ أَخْلاقًا',
        explanation: 'Being polite, saying "please" and "thank you," and being kind to others makes you a superstar in the eyes of Allah.',
        lesson: 'Treat everyone with the same kindness you would like them to show you.',
        grade: 'Authentic (Sahih)',
        image: `/api/proxy-image?url=${encodeURIComponent('https://gen.pollinations.ai/image/two children sharing a toy, smiling, polite behavior, vibrant colors, cartoon style?width=1024&height=1024&seed=204')}`
    },
    {
        id: '5',
        topic: 'Smiling',
        text: 'Your smiling in the face of your brother is charity.',
        textAr: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
        explanation: 'A simple smile can make someone\'s day much better, and Allah rewards you for it as if you gave money to the poor!',
        lesson: 'Share your beautiful smile with everyone you meet today.',
        grade: 'Authentic (Sahih)',
        image: `/api/proxy-image?url=${encodeURIComponent('https://gen.pollinations.ai/image/a big happy sun with a friendly face, smiling brightly over a playground, cheerful colors?width=1024&height=1024&seed=205')}`
    },
    {
        id: '6',
        topic: 'Controlling Anger',
        text: 'The strong man is not the good wrestler; the strong man is only the one who controls himself when he is angry.',
        textAr: 'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ',
        explanation: 'True strength isn\'t about having big muscles; it\'s about being able to stay calm even when you feel like shouting.',
        lesson: 'When you feel angry, take a deep breath and say "A\'udhu billahi minash-shaytanir-rajim."',
        grade: 'Authentic (Sahih)',
        image: `/api/proxy-image?url=${encodeURIComponent('https://gen.pollinations.ai/image/a child meditating calmly, peaceful blue and green surroundings, zen-like atmosphere for kids?width=1024&height=1024&seed=206')}`
    },
    {
        id: '7',
        topic: 'Love for Others',
        text: 'None of you [truly] believes until he loves for his brother that which he loves for himself.',
        textAr: 'لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
        explanation: 'We should want all the good things we have—like toys, snacks, and happiness—for our friends and siblings too.',
        lesson: 'Share your favorite things and be happy for others when they get something nice.',
        grade: 'Authentic (Sahih)',
        image: `/api/proxy-image?url=${encodeURIComponent('https://gen.pollinations.ai/image/sharing a box of colorful candies or toys, hearts floating, warm friendship?width=1024&height=1024&seed=207')}`
    },
    {
        id: '8',
        topic: 'Gratitude',
        text: 'He who does not thank people, does not thank Allah.',
        textAr: 'مَنْ لَا يَشْكُرِ النَّاسَ لَا يَشْكُرِ اللَّهَ',
        explanation: 'To show we are grateful to Allah, we must first learn to say "Thank you" to our parents, teachers, and friends.',
        lesson: 'Always say "Thank you" (JazakAllahu Khayran) when someone does something nice for you.',
        grade: 'Authentic (Sahih)',
        image: `/api/proxy-image?url=${encodeURIComponent('https://gen.pollinations.ai/image/a child writing a thank you card, happy colors, flowers in background, grateful expression?width=1024&height=1024&seed=208')}`
    },
    {
        id: '9',
        topic: 'Mercy to Children',
        text: 'He is not one of us who does not show mercy to our young ones and recognize the rights of our elders.',
        textAr: 'لَيْسَ مِنَّا مَنْ لَمْ يَرْحَمْ صَغِيرَنَا وَيَعْرِفْ شَرَفَ كَبِيرِنَا',
        explanation: 'Islam is all about being gentle with little kids and being very respectful to our grandparents and older people.',
        lesson: 'Be kind to your younger siblings and listen politely to your elders.',
        grade: 'Authentic (Sahih)',
        image: `/api/proxy-image?url=${encodeURIComponent('https://gen.pollinations.ai/image/an older child reading a book to a younger child, cozy beanbag chair, warm light?width=1024&height=1024&seed=209')}`
    },
    {
        id: '10',
        topic: 'Seeking Knowledge',
        text: 'Seeking knowledge is an obligation upon every Muslim.',
        textAr: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
        explanation: 'Learning about the world, science, and our Deen is a super important job that Allah gave to all of us.',
        lesson: 'Be curious and always look for opportunities to learn something new every day!',
        grade: 'Authentic (Sahih)',
        image: `/api/proxy-image?url=${encodeURIComponent('https://gen.pollinations.ai/image/a child looking through a telescope at planets, stars, books around, magical learning?width=1024&height=1024&seed=210')}`
    }
];
