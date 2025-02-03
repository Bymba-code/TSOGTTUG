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

    const totalTopicsNeeded = parseInt(testNumber);
    let selectedTests = [];
    let selectedTestIds = new Set();

    // First, try to get one test from each topic
    for (const topic of topics) {
      if (selectedTests.length >= totalTopicsNeeded) break;

      let query = `
        SELECT * FROM test
        WHERE topic = ${topic.id} 
        AND category = ${parseInt(category)}
      `;
      
      if (selectedTestIds.size > 0) {
        query += ` AND id NOT IN (${Array.from(selectedTestIds).join(',')})`;
      }
      
      query += ` ORDER BY RAND() LIMIT 1`;

      const tests = await prisma.$queryRawUnsafe(query);

      if (tests.length > 0 && !selectedTestIds.has(tests[0].id)) {
        selectedTests.push(tests[0]);
        selectedTestIds.add(tests[0].id);
      }
    }

    // If we still need more tests, randomly select additional tests from any topic
    while (selectedTests.length < totalTopicsNeeded) {
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      let query = `
        SELECT * FROM test
        WHERE topic = ${randomTopic.id} 
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
      } else {
        // Try getting any test from any topic
        let fallbackQuery = `
          SELECT * FROM test
          WHERE category = ${parseInt(category)}
        `;
        
        if (selectedTestIds.size > 0) {
          fallbackQuery += ` AND id NOT IN (${Array.from(selectedTestIds).join(',')})`;
        }
        
        fallbackQuery += ` ORDER BY RAND() LIMIT 1`;

        const fallbackTests = await prisma.$queryRawUnsafe(fallbackQuery);

        if (fallbackTests.length === 0) {
          break;
        }

        selectedTests.push(fallbackTests[0]);
        selectedTestIds.add(fallbackTests[0].id);
      }
    }

    // Check if we have enough tests after all attempts
    if (selectedTests.length < totalTopicsNeeded) {
      return res.status(400).json({
        success: false,
        data: [],
        message: `Хангалттай тест олдсонгүй. Шаардлагатай: ${totalTopicsNeeded}, Олдсон: ${selectedTests.length}`,
      });
    }

    // Create a new exam entry
    const newExam = await prisma.exam.create({
      data: {
        user: req.user.id,
        isMake: 0,
        date: new Date(),
      },
    });

    // Add the selected tests to the new exam
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
