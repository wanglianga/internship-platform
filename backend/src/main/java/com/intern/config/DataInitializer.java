package com.intern.config;

import com.intern.entity.*;
import com.intern.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final EnterpriseRepository enterpriseRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final AgreementRepository agreementRepository;
    private final ReviewRepository reviewRepository;
    private final CounselorRepository counselorRepository;
    private final RiskAlertRepository riskAlertRepository;
    private final com.intern.repository.TrainingProgramRepository trainingProgramRepository;
    private final com.intern.repository.TrainingProgramMatchRepository trainingProgramMatchRepository;
    private final com.intern.repository.JobWithdrawalRepository jobWithdrawalRepository;

    @Override
    public void run(String... args) {
        initEnterprises();
        initCounselors();
        initStudents();
        initJobs();
        initApplications();
        initAgreements();
        initReviews();
        initRiskAlerts();
        initTrainingPrograms();
        initTrainingProgramMatches();
    }

    private void initEnterprises() {
        enterpriseRepository.saveAll(List.of(
                Enterprise.builder().name("阿里巴巴").industry("互联网/电商")
                        .contactPerson("张经理").contactPhone("0571-88888001").email("hr@alibaba.com")
                        .address("浙江省杭州市余杭区文一西路969号").build(),
                Enterprise.builder().name("腾讯科技").industry("互联网/社交")
                        .contactPerson("李总监").contactPhone("0755-86013388").email("hr@tencent.com")
                        .address("广东省深圳市南山区科技中一路腾讯大厦").build(),
                Enterprise.builder().name("华为技术").industry("通信/硬件")
                        .contactPerson("王主管").contactPhone("0755-28780808").email("hr@huawei.com")
                        .address("广东省深圳市龙岗区坂田华为基地").build()
        ));
    }

    private void initCounselors() {
        counselorRepository.saveAll(List.of(
                Counselor.builder().name("陈老师").department("计算机学院")
                        .phone("13800001001").email("chen@university.edu.cn").build(),
                Counselor.builder().name("刘老师").department("信息工程学院")
                        .phone("13800001002").email("liu@university.edu.cn").build(),
                Counselor.builder().name("赵老师").department("数学学院")
                        .phone("13800001003").email("zhao@university.edu.cn").build()
        ));
    }

    private void initStudents() {
        studentRepository.saveAll(List.of(
                Student.builder().name("张三").studentNo("2021010001").major("计算机科学与技术")
                        .grade("大三").phone("13900001001").email("zhangsan@stu.edu.cn")
                        .preferredCities("杭州,深圳").resume("熟练掌握Java, Spring Boot")
                        .courses("数据结构,操作系统,计算机网络").hasBreachRecord(false).build(),
                Student.builder().name("李四").studentNo("2021010002").major("软件工程")
                        .grade("大三").phone("13900001002").email("lisi@stu.edu.cn")
                        .preferredCities("北京,上海").resume("熟悉前端开发, React")
                        .courses("软件工程,数据库原理,Web开发").hasBreachRecord(false).build(),
                Student.builder().name("王五").studentNo("2021010003").major("数据科学")
                        .grade("研一").phone("13900001003").email("wangwu@stu.edu.cn")
                        .preferredCities("北京,杭州").resume("擅长Python数据分析,机器学习")
                        .courses("机器学习,统计分析,数据挖掘").hasBreachRecord(false).build(),
                Student.builder().name("赵六").studentNo("2021010004").major("电子信息工程")
                        .grade("大三").phone("13900001004").email("zhaoliu@stu.edu.cn")
                        .preferredCities("深圳,广州").resume("嵌入式开发经验")
                        .courses("信号处理,嵌入式系统,通信原理").hasBreachRecord(true).build(),
                Student.builder().name("孙七").studentNo("2021010005").major("信息管理")
                        .grade("大三").phone("13900001005").email("sunqi@stu.edu.cn")
                        .preferredCities("上海,杭州").resume("数据库管理,信息系统设计")
                        .courses("信息系统,数据库管理,项目管理").hasBreachRecord(false).build(),
                Student.builder().name("周八").studentNo("2021010006").major("数学")
                        .grade("研一").phone("13900001006").email("zhouba@stu.edu.cn")
                        .preferredCities("北京,上海").resume("数学建模,算法优化")
                        .courses("数值分析,运筹学,概率论").hasBreachRecord(false).build(),
                Student.builder().name("吴九").studentNo("2021010007").major("计算机科学与技术")
                        .grade("大四").phone("13900001007").email("wujiu@stu.edu.cn")
                        .preferredCities("深圳,杭州").resume("全栈开发,微服务架构")
                        .courses("分布式系统,云计算,软件架构").hasBreachRecord(true).build(),
                Student.builder().name("郑十").studentNo("2021010008").major("软件工程")
                        .grade("大三").phone("13900001008").email("zhengshi@stu.edu.cn")
                        .preferredCities("杭州,南京").resume("移动端开发, Flutter")
                        .courses("移动开发,软件测试,设计模式").hasBreachRecord(false).build()
        ));
    }

    private void initJobs() {
        jobRepository.saveAll(List.of(
                Job.builder().enterpriseId(1L).title("Java开发实习生")
                        .description("参与核心业务系统开发，使用Java/Spring Boot技术栈")
                        .location("杭州").salaryRange("300-400/天")
                        .majorRequirements("计算机科学与技术,软件工程").headcount(3)
                        .status("OPEN").mentorName("杨导师").createdAt(LocalDateTime.now().minusDays(10)).build(),
                Job.builder().enterpriseId(2L).title("前端开发实习生")
                        .description("负责Web前端开发，使用React/Vue技术栈")
                        .location("深圳").salaryRange("250-350/天")
                        .majorRequirements("软件工程,计算机科学与技术").headcount(2)
                        .status("OPEN").mentorName("黄导师").createdAt(LocalDateTime.now().minusDays(8)).build(),
                Job.builder().enterpriseId(1L).title("数据分析实习生")
                        .description("负责数据分析和可视化，使用Python/SQL")
                        .location("杭州").salaryRange("250-350/天")
                        .majorRequirements("数据科学,数学,统计学").headcount(2)
                        .status("OPEN").mentorName("林导师").createdAt(LocalDateTime.now().minusDays(6)).build(),
                Job.builder().enterpriseId(3L).title("产品经理实习生")
                        .description("参与产品规划和需求分析，协助产品迭代")
                        .location("深圳").salaryRange("200-300/天")
                        .majorRequirements("信息管理,计算机科学与技术").headcount(1)
                        .status("OPEN").mentorName("徐导师").createdAt(LocalDateTime.now().minusDays(5)).build(),
                Job.builder().enterpriseId(3L).title("测试开发实习生")
                        .description("负责自动化测试框架搭建和测试用例编写")
                        .location("北京").salaryRange("250-350/天")
                        .majorRequirements("软件工程,计算机科学与技术").headcount(2)
                        .status("FILLED").mentorName("孙导师").createdAt(LocalDateTime.now().minusDays(15)).build(),
                Job.builder().enterpriseId(2L).title("算法实习生")
                        .description("参与推荐算法研发，使用深度学习框架")
                        .location("上海").salaryRange("350-400/天")
                        .majorRequirements("数据科学,数学,计算机科学与技术").headcount(1)
                        .status("OPEN").mentorName("马导师").createdAt(LocalDateTime.now().minusDays(3)).build()
        ));
    }

    private void initApplications() {
        applicationRepository.saveAll(List.of(
                Application.builder().studentId(1L).jobId(1L).status("PENDING_SCREENING")
                        .appliedAt(LocalDateTime.now().minusDays(5)).build(),
                Application.builder().studentId(2L).jobId(2L).status("INTERVIEWING")
                        .interviewTime("2026-06-15 14:00").interviewLocation("腾讯大厦B座3楼").interviewMethod("现场面试")
                        .appliedAt(LocalDateTime.now().minusDays(4)).interviewedAt(LocalDateTime.now().minusDays(1)).build(),
                Application.builder().studentId(3L).jobId(3L).status("HIRED")
                        .appliedAt(LocalDateTime.now().minusDays(10)).interviewedAt(LocalDateTime.now().minusDays(7)).hiredAt(LocalDateTime.now().minusDays(3)).build(),
                Application.builder().studentId(4L).jobId(1L).status("REJECTED")
                        .appliedAt(LocalDateTime.now().minusDays(8)).interviewedAt(LocalDateTime.now().minusDays(5)).build(),
                Application.builder().studentId(5L).jobId(4L).status("DEPARTMENT_REVIEW")
                        .appliedAt(LocalDateTime.now().minusDays(6)).interviewedAt(LocalDateTime.now().minusDays(3)).build(),
                Application.builder().studentId(6L).jobId(6L).status("AGREEMENT_PENDING")
                        .appliedAt(LocalDateTime.now().minusDays(9)).interviewedAt(LocalDateTime.now().minusDays(6)).hiredAt(LocalDateTime.now().minusDays(2)).build(),
                Application.builder().studentId(7L).jobId(1L).status("ACTIVE")
                        .appliedAt(LocalDateTime.now().minusDays(20)).interviewedAt(LocalDateTime.now().minusDays(17)).hiredAt(LocalDateTime.now().minusDays(14)).build(),
                Application.builder().studentId(8L).jobId(2L).status("COMPLETED")
                        .appliedAt(LocalDateTime.now().minusDays(30)).interviewedAt(LocalDateTime.now().minusDays(27)).hiredAt(LocalDateTime.now().minusDays(24)).build(),
                Application.builder().studentId(1L).jobId(6L).status("PENDING_SCREENING")
                        .appliedAt(LocalDateTime.now().minusDays(2)).build(),
                Application.builder().studentId(5L).jobId(3L).status("INTERVIEWING")
                        .interviewTime("2026-06-16 10:00").interviewLocation("线上面试").interviewMethod("视频面试")
                        .appliedAt(LocalDateTime.now().minusDays(3)).build(),
                Application.builder().studentId(8L).jobId(1L).status("PENDING_HIRE")
                        .appliedAt(LocalDateTime.now().minusDays(7)).interviewedAt(LocalDateTime.now().minusDays(4)).build()
        ));
    }

    private void initAgreements() {
        agreementRepository.saveAll(List.of(
                Agreement.builder().applicationId(3L).status("PENDING")
                        .generatedAt(LocalDateTime.now().minusDays(3)).build(),
                Agreement.builder().applicationId(6L).status("STAMPED")
                        .generatedAt(LocalDateTime.now().minusDays(5)).stampedAt(LocalDateTime.now().minusDays(2)).build(),
                Agreement.builder().applicationId(7L).status("ACTIVE")
                        .generatedAt(LocalDateTime.now().minusDays(14)).stampedAt(LocalDateTime.now().minusDays(12)).build(),
                Agreement.builder().applicationId(4L).status("CHANGING")
                        .generatedAt(LocalDateTime.now().minusDays(7)).stampedAt(LocalDateTime.now().minusDays(5))
                        .changeReason("实习时间调整").build(),
                Agreement.builder().applicationId(8L).status("BREACHED")
                        .generatedAt(LocalDateTime.now().minusDays(24)).stampedAt(LocalDateTime.now().minusDays(22))
                        .breachReason("个人原因提前终止实习").breachParty("STUDENT").build()
        ));
    }

    private void initReviews() {
        reviewRepository.saveAll(List.of(
                Review.builder().applicationId(5L).counselorId(1L).type("DEPARTMENT").status("PENDING")
                        .reviewedAt(LocalDateTime.now().minusDays(3)).build(),
                Review.builder().applicationId(5L).counselorId(2L).type("AGREEMENT").status("PENDING")
                        .reviewedAt(LocalDateTime.now().minusDays(2)).build(),
                Review.builder().applicationId(6L).counselorId(1L).type("AGREEMENT").status("APPROVED")
                        .comment("同意签署三方协议").reviewedAt(LocalDateTime.now().minusDays(1)).build(),
                Review.builder().applicationId(3L).counselorId(1L).type("DEPARTMENT").status("APPROVED")
                        .comment("专业对口，同意实习").reviewedAt(LocalDateTime.now().minusDays(5)).build(),
                Review.builder().applicationId(4L).counselorId(2L).type("DEPARTMENT").status("REJECTED")
                        .comment("专业不符，建议选择其他岗位").reviewedAt(LocalDateTime.now().minusDays(4)).build(),
                Review.builder().applicationId(7L).counselorId(1L).type("AGREEMENT").status("APPROVED")
                        .comment("协议内容合规").reviewedAt(LocalDateTime.now().minusDays(13)).build()
        ));
    }

    private void initRiskAlerts() {
        riskAlertRepository.saveAll(List.of(
                RiskAlert.builder().type("MAJOR_MISMATCH").level("MEDIUM").status("ACTIVE")
                        .description("学生赵六(电子信息工程)申请的岗位要求计算机科学与技术/软件工程专业")
                        .relatedStudentId(4L).relatedJobId(1L)
                        .detectedAt(LocalDateTime.now().minusDays(8)).build(),
                RiskAlert.builder().type("DUPLICATE_SIGNING").level("HIGH").status("PENDING")
                        .description("学生吴九已有活跃三方协议，再次申请实习岗位")
                        .relatedStudentId(7L).relatedAgreementId(3L)
                        .detectedAt(LocalDateTime.now().minusDays(2)).build(),
                RiskAlert.builder().type("JOB_WITHDRAWN").level("MEDIUM").status("RESOLVED")
                        .description("岗位前端开发实习生已被撤回，相关申请需处理")
                        .relatedJobId(2L)
                        .resolution("已通知相关学生，申请已自动终止")
                        .detectedAt(LocalDateTime.now().minusDays(10)).resolvedAt(LocalDateTime.now().minusDays(9)).build(),
                RiskAlert.builder().type("STUDENT_BREACH").level("HIGH").status("ACTIVE")
                        .description("学生赵六违反三方协议，提前终止实习")
                        .relatedStudentId(4L).relatedAgreementId(5L)
                        .detectedAt(LocalDateTime.now().minusDays(1)).build(),
                RiskAlert.builder().type("MAJOR_MISMATCH").level("LOW").status("RESOLVED")
                        .description("学生孙七(信息管理)申请的岗位推荐数据科学专业，但信息管理也符合要求")
                        .relatedStudentId(5L).relatedJobId(3L)
                        .resolution("经核实，信息管理专业也符合岗位要求")
                        .detectedAt(LocalDateTime.now().minusDays(6)).resolvedAt(LocalDateTime.now().minusDays(5)).build()
        ));
    }

    private void initTrainingPrograms() {
        trainingProgramRepository.saveAll(List.of(
                com.intern.entity.TrainingProgram.builder()
                        .major("计算机科学与技术")
                        .requiredJobResponsibilities("开发,编程,系统,算法")
                        .requiredCredits(16)
                        .requiredInternshipMonths(6)
                        .department("计算机学院")
                        .createdAt(LocalDateTime.now().minusDays(30))
                        .build(),
                com.intern.entity.TrainingProgram.builder()
                        .major("软件工程")
                        .requiredJobResponsibilities("开发,编程,软件,测试,前端,后端")
                        .requiredCredits(16)
                        .requiredInternshipMonths(6)
                        .department("计算机学院")
                        .createdAt(LocalDateTime.now().minusDays(30))
                        .build(),
                com.intern.entity.TrainingProgram.builder()
                        .major("数据科学")
                        .requiredJobResponsibilities("数据,分析,机器学习,算法,统计")
                        .requiredCredits(18)
                        .requiredInternshipMonths(6)
                        .department("数学学院")
                        .createdAt(LocalDateTime.now().minusDays(30))
                        .build(),
                com.intern.entity.TrainingProgram.builder()
                        .major("电子信息工程")
                        .requiredJobResponsibilities("硬件,嵌入式,通信,电子,电路")
                        .requiredCredits(16)
                        .requiredInternshipMonths(6)
                        .department("信息工程学院")
                        .createdAt(LocalDateTime.now().minusDays(30))
                        .build(),
                com.intern.entity.TrainingProgram.builder()
                        .major("信息管理")
                        .requiredJobResponsibilities("管理,信息系统,产品,数据,项目")
                        .requiredCredits(14)
                        .requiredInternshipMonths(4)
                        .department("信息工程学院")
                        .createdAt(LocalDateTime.now().minusDays(30))
                        .build(),
                com.intern.entity.TrainingProgram.builder()
                        .major("数学")
                        .requiredJobResponsibilities("算法,数据,分析,统计,建模")
                        .requiredCredits(18)
                        .requiredInternshipMonths(6)
                        .department("数学学院")
                        .createdAt(LocalDateTime.now().minusDays(30))
                        .build()
        ));
    }

    private void initTrainingProgramMatches() {
        trainingProgramMatchRepository.saveAll(List.of(
                com.intern.entity.TrainingProgramMatch.builder()
                        .applicationId(3L)
                        .trainingProgramId(3L)
                        .majorMatched(true)
                        .responsibilitiesMatched(true)
                        .creditsMatched(true)
                        .durationMatched(true)
                        .overallStatus("MATCHED")
                        .counselorAction("NONE")
                        .matchedAt(LocalDateTime.now().minusDays(4))
                        .build(),
                com.intern.entity.TrainingProgramMatch.builder()
                        .applicationId(5L)
                        .trainingProgramId(5L)
                        .majorMatched(true)
                        .responsibilitiesMatched(false)
                        .creditsMatched(true)
                        .durationMatched(true)
                        .overallStatus("UNMATCHED")
                        .counselorAction("PENDING")
                        .counselorComment("岗位职责不完全匹配，需补充说明")
                        .matchedAt(LocalDateTime.now().minusDays(2))
                        .build(),
                com.intern.entity.TrainingProgramMatch.builder()
                        .applicationId(6L)
                        .trainingProgramId(6L)
                        .majorMatched(true)
                        .responsibilitiesMatched(true)
                        .creditsMatched(true)
                        .durationMatched(true)
                        .overallStatus("MATCHED")
                        .counselorAction("NONE")
                        .matchedAt(LocalDateTime.now().minusDays(3))
                        .build()
        ));
    }
}
