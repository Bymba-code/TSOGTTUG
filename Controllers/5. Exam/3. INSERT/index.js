const prisma = require("../../../Middlewares/prisma");

const INSERT_EXAM = async (req, res) => {
  try {
    const { category, testNumber } = req.body;

    if (!category) {
      return res.status(403).json({
        success: false,
        data: [],
        message: "Жолооны ангилал алга байна.",
      });
    }

    if (!testNumber || isNaN(testNumber) || parseInt(testNumber) <= 0) {
      return res.status(400).json({
        success: false,
        data: [],
        message: "Хүссэн тестийн тоо буруу байна.",
      });
    }

    const isCategory = await prisma.category.findFirst({
      where: { id: parseInt(category) },
    });

    if (!isCategory) {
      return res.status(404).json({
        success: false,
        data: [],
        message: "Жолооны ангилал байхгүй байна.",
      });
    }

    const topics = await prisma.topic.findMany({
      where: { category: parseInt(category) },
    });

    if (topics.length === 0) {
      return res.status(404).json({
        success: false,
        data: [],
        message: "Холбогдох сэдэв байхгүй байна.",
      });
    }

    const totalTestsNeeded = parseInt(testNumber);
    let selectedTests = [];
    let selectedTestIds = new Set();

    // Бүх сэдвийг санамсаргүй байдлаар холих
    const shuffledTopics = [...topics].sort(() => Math.random() - 0.5);
    
    // Сэдэв бүрээс авах тестийн тоог тооцоолох
    const testsPerTopic = Math.floor(totalTestsNeeded / shuffledTopics.length);
    const remainingTests = totalTestsNeeded % shuffledTopics.length;

    // 1-р шат: Сэдэв бүрээс тэгш хуваарилж тест авах
    for (let i = 0; i < shuffledTopics.length; i++) {
      const topic = shuffledTopics[i];
      // Эхний сэдвүүдээс нэмэлт 1 тест авах (үлдэгдэл тестүүдийг хуваарилах)
      const testsToTake = testsPerTopic + (i < remainingTests ? 1 : 0);
      
      if (testsToTake === 0) continue;

      let query = `
        SELECT * FROM test
        WHERE topic = ${topic.id} 
        AND category = ${parseInt(category)}
      `;
      
      if (selectedTestIds.size > 0) {
        query += ` AND id NOT IN (${Array.from(selectedTestIds).join(',')})`;
      }
      
      query += ` ORDER BY RAND() LIMIT ${testsToTake}`;

      const tests = await prisma.$queryRawUnsafe(query);

      for (const test of tests) {
        if (!selectedTestIds.has(test.id)) {
          selectedTests.push(test);
          selectedTestIds.add(test.id);
        }
      }
    }

    // 2-р шат: Хэрэв хангалтгүй тест байвал дахин авах
    let attemptCount = 0;
    const maxAttempts = shuffledTopics.length * 2;

    while (selectedTests.length < totalTestsNeeded && attemptCount < maxAttempts) {
      // Дахин санамсаргүй сэдвүүдийг холих
      const retryTopics = [...shuffledTopics].sort(() => Math.random() - 0.5);
      
      for (const topic of retryTopics) {
        if (selectedTests.length >= totalTestsNeeded) break;

        let query = `
          SELECT * FROM test
          WHERE topic = ${topic.id} 
          AND category = ${parseInt(category)}
        `;
        
        if (selectedTestIds.size > 0) {
          query += ` AND id NOT IN (${Array.from(selectedTestIds).join(',')})`;
        }
        
        query += ` ORDER BY RAND() LIMIT 1`;

        const additionalTests = await prisma.$queryRawUnsafe(query);

        if (additionalTests.length > 0 && !selectedTestIds.has(additionalTests[0].id)) {
          selectedTests.push(additionalTests[0]);
          selectedTestIds.add(additionalTests[0].id);
        }
      }
      
      attemptCount++;
    }

    // 3-р шат: Хэрэв одоо ч хүрэлцэхгүй байвал бүх тестээс санамсаргүй авах
    if (selectedTests.length < totalTestsNeeded) {
      const needed = totalTestsNeeded - selectedTests.length;
      
      let fallbackQuery = `
        SELECT * FROM test
        WHERE category = ${parseInt(category)}
      `;
      
      if (selectedTestIds.size > 0) {
        fallbackQuery += ` AND id NOT IN (${Array.from(selectedTestIds).join(',')})`;
      }
      
      fallbackQuery += ` ORDER BY RAND() LIMIT ${needed}`;

      const fallbackTests = await prisma.$queryRawUnsafe(fallbackQuery);

      for (const test of fallbackTests) {
        if (!selectedTestIds.has(test.id)) {
          selectedTests.push(test);
          selectedTestIds.add(test.id);
        }
      }
    }

    // Хангалттай тест байгаа эсэхийг шалгах
    if (selectedTests.length < totalTestsNeeded) {
      return res.status(400).json({
        success: false,
        data: [],
        message: `Хангалттай тест олдсонгүй. Шаардлагатай: ${totalTestsNeeded}, Олдсон: ${selectedTests.length}`,
      });
    }

    // Тестүүдийг дахин санамсаргүй байдлаар холих (сэдвүүд холилдсон байх)
    selectedTests = selectedTests.sort(() => Math.random() - 0.5);

    // Шинэ шалгалт үүсгэх
    const newExam = await prisma.exam.create({
      data: {
        user: req.user.id,
        isMake: 0,
        date: new Date(),
      },
    });

    // Сонгогдсон тестүүдийг шалгалтанд нэмэх
    const examTests = selectedTests.map((test) => ({
      exam: newExam.id,
      test: test.id,
      answer: null,
    }));

    await prisma.exam_test.createMany({ data: examTests });

    return res.status(200).json({
      success: true,
      data: {
        exam: newExam,
        tests: selectedTests,
      },
      message: "Амжилттай шалгалт үүсгэлээ.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      data: [],
      message: "Серверийн алдаа гарлаа: " + err.message,
    });
  }
};

module.exports = INSERT_EXAM;