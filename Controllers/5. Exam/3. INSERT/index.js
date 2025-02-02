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

    let selectedTopics = [];
    const totalTopicsNeeded = parseInt(testNumber);

    // Randomly pick topics from available topics
    while (selectedTopics.length < totalTopicsNeeded && topics.length > 0) {
      let randomIndex = Math.floor(Math.random() * topics.length);
      selectedTopics.push(topics[randomIndex]);
      topics.splice(randomIndex, 1);  // Remove selected topic from the remaining pool
    }

    let selectedTests = [];
    let selectedTestIds = new Set(); // Store selected test IDs to avoid duplicates

    // Get random tests from selected topics
    for (const topic of selectedTopics) {
      const tests = await prisma.$queryRaw`
        SELECT * FROM test
        WHERE topic = ${topic.id} AND category = ${parseInt(category)}
        ORDER BY RAND()
        LIMIT 1;
      `;

      if (tests.length > 0) {
        // Check if test has already been selected
        if (!selectedTestIds.has(tests[0].id)) {
          selectedTests.push(tests[0]); // Push 1 random test from each selected topic
          selectedTestIds.add(tests[0].id); // Add test ID to the set to prevent duplicates
        }
      }
    }

    // Ensure we have enough tests
    if (selectedTests.length < totalTopicsNeeded) {
      return res.status(400).json({
        success: false,
        data: [],
        message: `Олдсон тестүүд ${totalTopicsNeeded}-д хүрсэнгүй. Нийт: ${selectedTests.length}`,
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
