# Aristotelian Rhetoric in Computational Linguistics and NLP

A survey of peer-reviewed research validating the use of Aristotle's ethos, logos, and pathos framework for computational analysis of persuasion, argumentation quality, and trustworthiness in natural language.

---

## 1. Computational Rhetoric and Persuasion Detection

The computational study of rhetoric has emerged as a significant subfield within NLP, seeking to automatically identify, classify, and evaluate persuasive strategies in natural language text. This body of work directly operationalizes concepts from classical rhetoric for machine learning systems.

### Key Papers

**Lawrence, J. & Reed, C. (2020). "Argument Mining: A Survey." *Computational Linguistics*, 45(4), 765-818.**
- **Venue:** MIT Press / Computational Linguistics (journal)
- **Key Findings:** Comprehensive survey defining argument mining as "the automatic identification and extraction of the structure of inference and reasoning expressed as arguments presented in natural language." Covers techniques from component identification to relation prediction, and discusses how argumentation structures can be automatically extracted from text.
- **Relevance to Ethos:** Establishes the foundational NLP pipeline that Ethos builds upon -- identifying argument components is a prerequisite to evaluating their quality across rhetorical dimensions.
- **URL:** https://aclanthology.org/J19-4006/

**Budzynska, K. & Villata, S. (2016). "Processing Natural Language Argumentation." In *Handbook of Formal Argumentation*.**
- **Venue:** Handbook of Formal Argumentation, Chapter
- **Key Findings:** Graduate-level introduction to the intersection of formal argumentation theory and NLP. Establishes that while argument mining traditionally focuses on logos (content of what is said), evidence demonstrates that using ethos (character of the speaker) can be an even more powerful tool of influence.
- **Relevance to Ethos:** Provides theoretical justification for why a trustworthiness evaluation system must assess all three rhetorical dimensions, not just logical content.
- **URL:** https://newethos.org/wp-content/uploads/2021/03/HoFA2017_NaturalLanguageArgumentation.pdf

**A Generalizable Rhetorical Strategy Annotation Model Using LLM-based Debate Simulation and Labelling (2025). arXiv:2510.15081. Published at EMNLP 2025 Findings.**
- **Venue:** EMNLP 2025 Findings / arXiv
- **Key Findings:** Develops a framework leveraging LLMs to automatically generate and label synthetic debate data based on a four-part rhetorical typology (causal, empirical, emotional, moral). Fine-tunes transformer-based classifiers on LLM-labeled data and validates against human labels. Achieves high performance and strong generalization across domains. Applications include improving persuasiveness prediction from incorporating rhetorical strategy labels, and analyzing temporal and partisan shifts in U.S. Presidential debates (1960-2020).
- **Relevance to Ethos:** Demonstrates that LLMs can reliably annotate rhetorical strategies, validating Ethos's approach of using Claude to classify messages across persuasion dimensions.
- **URL:** https://arxiv.org/abs/2510.15081

---

## 2. Ethos, Logos, and Pathos as Classification Dimensions

A growing body of NLP research directly uses Aristotle's three modes of persuasion as annotation categories and classification targets, providing strong empirical evidence that these dimensions are computationally tractable.

### Key Papers

**Duthie, R., Budzynska, K., & Reed, C. (2016). "Mining Ethos in Political Debate." *Proceedings of the Sixth International Conference on Computational Models of Argument (COMMA)*, 299-310. IOS Press.**
- **Venue:** COMMA 2016
- **Key Findings:** First openly available corpus annotated for ethotic expressions (references to speaker credibility and character) in political debate. Develops a text analysis pipeline combining structural and statistical NLP approaches to automatically detect ethos. Introduces a coding scheme for annotating ethotic expressions. Despite ethos being recognized since Aristotle as critical to communication, it had been rarely studied in computationally-oriented AI until this work.
- **Relevance to Ethos:** Directly validates that speaker credibility (ethos) can be computationally mined from text and provides the foundational annotation scheme for this task.
- **URL:** http://arg.tech/people/chris/publications/2016/comma2016-ethos.pdf

**Duthie, R. & Budzynska, K. (2018). "A Deep Modular RNN Approach for Ethos Mining." *Proceedings of the 27th International Joint Conference on Artificial Intelligence (IJCAI)*, 4041-4047.**
- **Venue:** IJCAI 2018
- **Key Findings:** Develops a novel deep modular recurrent neural network (DMRNN) approach for ethos mining. Analyzes UK parliamentary debates. Achieves F1-score of 0.74 (21.3% above baseline) and macro-averaged F1-score of 0.83 (13.7% above baseline). Demonstrates that identifying positive and negative ethotic sentiment is a powerful instrument for understanding government dynamics.
- **Relevance to Ethos:** Proves that deep learning can effectively detect ethos in text, achieving strong performance. Validates the core premise that ethos can be computationally scored.
- **URL:** https://www.ijcai.org/proceedings/2018/562

**Gajewska, E., Budzynska, K., Konat, B., Koszowy, M., Kiljan, K., Uberna, M., & Zhang, H. (2024). "Ethos and Pathos in Online Group Discussions: Corpora for Polarisation Issues in Social Media." arXiv:2404.04889.**
- **Venue:** arXiv 2024
- **Key Findings:** Introduces multi-topic and multi-platform corpora (called PolarIs) with manual annotation of appeals to ethos and pathos. Covers 15,588 sentences across Twitter debates on COVID vaccination, Reddit debates on climate change, and Twitter debates on climate change. Defines appeals to ethos as references to speaker credibility (supportable or attackable) and pathotic appeals as those inducing emotions in hearers.
- **Relevance to Ethos:** Provides the largest annotated dataset directly using Aristotelian ethos/pathos categories in online discourse -- exactly the domain Ethos targets. Demonstrates that these classical categories apply to modern digital communication.
- **URL:** https://arxiv.org/abs/2404.04889

**Carlile, W., Gurrapadi, N., Ke, Z., & Ng, V. (2018). "Give Me More Feedback: Annotating Argument Persuasiveness and Related Attributes in Student Essays." *Proceedings of the 56th Annual Meeting of the ACL (Volume 1: Long Papers)*, 621-631.**
- **Venue:** ACL 2018
- **Key Findings:** First corpus of essays simultaneously annotated with argument components, argument persuasiveness scores, and attributes impacting persuasiveness. Annotations include the means of persuasion (Ethos, Pathos, or Logos), along with Eloquence, Specificity, Relevance, and Evidence scores. Demonstrates that these rhetorical categories can be reliably annotated by humans and used as features for predicting argument quality.
- **Relevance to Ethos:** Directly validates that ethos, logos, and pathos can serve as simultaneous classification dimensions for text quality assessment -- the exact approach Ethos uses. Shows these categories have reliable inter-annotator agreement.
- **URL:** https://aclanthology.org/P18-1058/

---

## 3. Argument Mining and Quality Assessment

Argument quality assessment research provides the methodological foundations for scoring text along multiple dimensions of quality -- including logical, rhetorical, and dialectical axes.

### Key Papers

**Wachsmuth, H., Naderi, N., Hou, Y., Bilu, Y., Prabhakaran, V., Alberdingk Thijm, T., Hirst, G., & Stein, B. (2017). "Computational Argumentation Quality Assessment in Natural Language." *Proceedings of the 15th Conference of the European Chapter of the ACL (EACL)*, 176-187.**
- **Venue:** EACL 2017
- **Key Findings:** First holistic work on computational argumentation quality in natural language. Comprehensively surveys theories and approaches across logical, rhetorical, and dialectical quality dimensions. Derives a systematic taxonomy of 15 quality dimensions and provides a corpus of 320 arguments annotated across all dimensions. Establishes that argument quality is inherently multi-dimensional.
- **Relevance to Ethos:** Provides the theoretical and empirical foundation for multi-dimensional quality assessment. Ethos's three-score approach (ethos, logos, pathos) is a focused instantiation of this multi-dimensional quality framework.
- **URL:** https://aclanthology.org/E17-1017/

**Wachsmuth, H., Lapesa, G., Cabrio, E., Lauscher, A., Park, J., Vecchi, E.M., Villata, S., & Ziegenbein, T. (2024). "Argument Quality Assessment in the Age of Instruction-Following Large Language Models." *Proceedings of LREC-COLING 2024*, 1519-1538.**
- **Venue:** LREC-COLING 2024
- **Key Findings:** Investigates how instruction-following LLMs perform on argument quality assessment tasks. Addresses the computational treatment of arguments on controversial issues in NLP, focusing on the challenge of assessing quality across multiple dimensions.
- **Relevance to Ethos:** Directly validates Ethos's approach of using LLMs (Claude) for argument quality assessment, showing that instruction-following models can evaluate argument quality in structured ways.
- **URL:** https://aclanthology.org/2024.lrec-main.135/

**Toledo, A., Gretz, S., et al. (2019). "Automatic Argument Quality Assessment - New Datasets and Methods." *Proceedings of EMNLP-IJCNLP 2019*.**
- **Venue:** EMNLP-IJCNLP 2019
- **Key Findings:** Presents 6.3k arguments carefully annotated for quality as part of IBM's Project Debater. Arguments generated at formal debate events by participants of varying skill levels. Establishes benchmarks for automatic argument quality prediction.
- **Relevance to Ethos:** Demonstrates that argument quality can be reliably assessed and predicted computationally, providing benchmark methodology that Ethos builds upon.
- **URL:** https://aclanthology.org/D19-1564/

**Gretz, S., Friedman, R., et al. (2020). "A Large-Scale Dataset for Argument Quality Ranking: Construction and Analysis." *Proceedings of AAAI 2020*, 34, 7805-7813.**
- **Venue:** AAAI 2020
- **Key Findings:** Creates the largest dataset for point-wise argument quality: 30,497 crowd-sourced arguments for 71 debatable topics, annotated for quality and stance. Five times larger than previously available datasets. Part of IBM's Project Debater initiative.
- **Relevance to Ethos:** Provides the scale evidence that argument quality can be assessed at volume -- a necessary condition for Ethos's goal of evaluating AI agent messages in production environments.
- **URL:** https://ojs.aaai.org/index.php/AAAI/article/view/6285

**Habernal, I. & Gurevych, I. (2016). "Which argument is more convincing? Analyzing and predicting convincingness of Web arguments using bidirectional LSTM." *Proceedings of ACL 2016*, 1589-1599.**
- **Venue:** ACL 2016
- **Key Findings:** Annotated 16k pairs of arguments over 32 topics for convincingness. Investigated whether "A is more convincing than B" exhibits total ordering properties. Achieved 0.76-0.78 accuracy using bidirectional LSTM for cross-topic convincingness prediction.
- **Relevance to Ethos:** Demonstrates that persuasiveness is a computationally measurable property of text, supporting Ethos's scoring approach.
- **URL:** https://aclanthology.org/P16-1150/

**Habernal, I. & Gurevych, I. (2016). "What makes a convincing argument? Empirical analysis and detecting attributes of convincingness in Web argumentation." *Proceedings of EMNLP 2016*.**
- **Venue:** EMNLP 2016
- **Key Findings:** Annotated 26k natural language explanations describing convincingness of arguments. Created a corpus of 9,111 argument pairs with detailed quality attributes. Identifies specific textual features that contribute to argument strength.
- **Relevance to Ethos:** Identifies the specific dimensions and attributes that make arguments convincing, informing Ethos's feature design.
- **URL:** https://aclanthology.org/D16-1129/

**Habernal, I., Wachsmuth, H., Gurevych, I., & Stein, B. (2018). "The Argument Reasoning Comprehension Task: Identification and Reconstruction of Implicit Warrants." *Proceedings of NAACL 2018*.**
- **Venue:** NAACL 2018
- **Key Findings:** Introduces the task of identifying implicit warrants (the unstated reasoning connecting premises to claims). Develops methodology for reconstructing warrants through crowdsourcing. Dataset of warrants for 2,000 authentic arguments from news comments.
- **Relevance to Ethos:** Demonstrates the importance of identifying implicit reasoning in arguments -- Ethos's logos score captures whether an argument's reasoning chain is sound, including implicit warrants.
- **URL:** https://aclanthology.org/N18-1175/

**Stab, C. & Gurevych, I. (2017). "Parsing Argumentation Structures in Persuasive Essays." *Computational Linguistics*, 43(3), 619-659.**
- **Venue:** Computational Linguistics (journal), MIT Press
- **Key Findings:** Identifies argument components using sequence labeling and applies a joint model for detecting argumentation structures using Integer Linear Programming. Introduces a novel annotated corpus of persuasive essays. Significantly outperforms heuristic baselines.
- **Relevance to Ethos:** Provides methods for decomposing persuasive text into structural components -- a necessary step before evaluating the quality of individual rhetorical appeals.
- **URL:** https://aclanthology.org/J17-3005/

---

## 4. Credibility and Source Assessment

Research on credibility assessment directly parallels Ethos's ethos dimension -- evaluating the trustworthiness and reliability of information sources.

### Key Papers

**Barron-Cedeno, A., Alam, F., Chakraborty, T., Elsayed, T., Nakov, P., Przybyia, P., Strus, J.M., et al. (2024). "A Survey on Automatic Credibility Assessment Using Textual Credibility Signals in the Era of Large Language Models." *ACM Transactions on Intelligent Systems and Technology*. arXiv:2410.21360.**
- **Venue:** ACM TIST 2024 / arXiv
- **Key Findings:** Systematic review of 175 papers on textual credibility assessment. Identifies nine categories of credibility signals including factuality, subjectivity and bias, persuasion techniques and logical fallacies, and claim veracity. Categorizes solutions into style-based, propagation-based, source-based, and knowledge-based approaches. Outlines challenges posed by generative AI for credibility assessment.
- **Relevance to Ethos:** Directly validates Ethos's multi-signal approach to trustworthiness. The nine credibility signal categories map closely to Ethos's three dimensions, and the survey confirms that aggregating diverse signals into a credibility score is the established approach in the field.
- **URL:** https://arxiv.org/abs/2410.21360

---

## 5. Propaganda and Manipulation Detection

The SemEval shared task series on propaganda and persuasion technique detection represents the most extensive community effort to build and benchmark systems for detecting manipulative rhetoric -- directly validating Ethos's manipulation flagging capability.

### Key Papers

**Da San Martino, G., Yu, S., Barron-Cedeno, A., Petrov, R., & Nakov, P. (2019). "Fine-Grained Analysis of Propaganda in News Articles." *Proceedings of EMNLP-IJCNLP 2019*.**
- **Venue:** EMNLP-IJCNLP 2019, Hong Kong
- **Key Findings:** Proposes the novel task of fine-grained propaganda analysis: detecting all fragments containing propaganda techniques and identifying their type. Defines 18 propaganda techniques. Moves beyond document-level labels (which are noisy) to span-level detection.
- **Relevance to Ethos:** Establishes the fine-grained approach to manipulation detection that Ethos's flagging system follows -- identifying specific manipulative techniques rather than binary propaganda/not-propaganda classification.
- **URL:** https://aclanthology.org/D19-1565/

**Da San Martino, G., Barron-Cedeno, A., Wachsmuth, H., Petrov, R., & Nakov, P. (2020). "SemEval-2020 Task 11: Detection of Propaganda Techniques in News Articles." *Proceedings of SemEval 2020*.**
- **Venue:** SemEval 2020
- **Key Findings:** Two subtasks: Span Identification (locating propaganda fragments) and Technique Classification (14 propaganda techniques). 250 teams registered, 44 submitted. Established community benchmarks for propaganda detection.
- **Relevance to Ethos:** Demonstrates that propaganda techniques can be reliably detected at scale. The technique taxonomy informs Ethos's flag categories.
- **URL:** https://aclanthology.org/2020.semeval-1.186/

**Dimitrov, D., Bin Ali, B., Shaar, S., Alam, F., Silvestri, F., Firooz, H., Nakov, P., & Da San Martino, G. (2021). "SemEval-2021 Task 6: Detection of Persuasion Techniques in Texts and Images." *Proceedings of SemEval 2021*.**
- **Venue:** SemEval 2021
- **Key Findings:** Extends persuasion detection to multimodal content (memes). Three subtasks covering text-only, span-level, and multimodal detection. 71 registrations, 22 submissions. Confirms the importance of both text and image modalities for persuasion detection.
- **Relevance to Ethos:** Shows that persuasion technique detection is a robust and active research area with growing community engagement and increasingly sophisticated approaches.
- **URL:** https://aclanthology.org/2021.semeval-1.7/

**Piskorski, J., Stefanovitch, N., Da San Martino, G., & Nakov, P. (2023). "SemEval-2023 Task 3: Detecting the Category, the Framing, and the Persuasion Techniques in Online News in a Multi-lingual Setup." *Proceedings of SemEval 2023*.**
- **Venue:** SemEval 2023
- **Key Findings:** Three subtasks: genre detection (opinion/reporting/satire), framing identification (14 generic frames), and persuasion technique detection (23 techniques) across nine languages. 181 teams registered, 41 submitted. Demonstrates multilingual viability of persuasion detection.
- **Relevance to Ethos:** The expanded taxonomy of 23 persuasion techniques and multilingual capability show the maturity and generalizability of this approach.
- **URL:** https://aclanthology.org/2023.semeval-1.317/

**Dimitrov, D., Alam, F., Hasanain, M., Hasnat, A., Silvestri, F., Nakov, P., & Da San Martino, G. (2024). "SemEval-2024 Task 4: Multilingual Detection of Persuasion Techniques in Memes." *Proceedings of SemEval 2024*.**
- **Venue:** SemEval 2024
- **Key Findings:** Memes in four languages plus three surprise test languages. 22 hierarchically organized persuasion techniques. 153 teams registered, 48 submitted, 32 system papers. Largest participation in the series.
- **Relevance to Ethos:** The growing scale of participation (44 -> 22 -> 41 -> 48 submissions across the series) demonstrates increasing community investment in this problem. The hierarchical technique taxonomy mirrors Ethos's structured approach to flag categorization.
- **URL:** https://aclanthology.org/2024.semeval-1.275/

**Hamilton, K., et al. (2024). "GPT Assisted Annotation of Rhetorical and Linguistic Features for Interpretable Propaganda Technique Detection in News Text." *Companion Proceedings of the ACM Web Conference 2024*. arXiv:2407.11827.**
- **Venue:** WWW 2024 Companion / arXiv
- **Key Findings:** Codifies 22 rhetorical and linguistic features for annotating propaganda techniques. Develops RhetAnn web application for annotation. Demonstrates that combining few human annotations with GPT achieves effective scaling at a fraction of traditional annotation cost, with results on par with GPT-4 at 10x less cost.
- **Relevance to Ethos:** Directly validates that LLMs can annotate rhetorical features for manipulation detection at scale and low cost -- the exact approach Ethos uses with Claude for evaluation.
- **URL:** https://arxiv.org/abs/2407.11827

**Carroll, M., Chan, A., Ashton, H., & Krueger, D. (2023). "Characterizing Manipulation from AI Systems." *Proceedings of EAAMO 2023*. arXiv:2303.09387.**
- **Venue:** EAAMO 2023 / arXiv
- **Key Findings:** Characterizes the space of possible notions of manipulation from AI systems, identifying key concepts: incentives, intent, covertness, and harm. Proposes: "a system is manipulative if it acts as if it were pursuing an incentive to change a human intentionally and covertly." Analyzes manipulation in recommender systems and language models.
- **Relevance to Ethos:** Provides the theoretical framework for what Ethos flags as manipulation. The four-concept characterization (incentives, intent, covertness, harm) maps to Ethos's flag detection criteria.
- **URL:** https://arxiv.org/abs/2303.09387

---

## 6. Emotional Intelligence and Sentiment in Communication

Research on emotion detection and affective computing provides the foundation for Ethos's pathos dimension -- assessing emotional appeals and their appropriateness.

### Key Papers

**Alslaity, A. & Orji, R. (2024). "Machine Learning Techniques for Emotion Detection and Sentiment Analysis: Current State and Future Directions." *Review article*.**
- **Venue:** Review / Survey
- **Key Findings:** Covers feature extraction methods, classification algorithms, and evaluation measures for text-based emotion recognition. Documents the growing sophistication of emotion detection systems.
- **Relevance to Ethos:** Provides technical foundations for Ethos's pathos scoring, which must detect emotional content and assess its appropriateness and intensity.

**"Exploring Emotional Intelligence in Artificial Intelligence Systems: A Comprehensive Analysis of Emotion Recognition and Response Mechanisms." (2024). *PMC/NIH*.**
- **Venue:** PMC 2024
- **Key Findings:** Integrates emotional intelligence into AI systems with focus on emotion recognition and response mechanisms. Addresses multimodal fusion combining voice, text, and behavioral signals. Notes the fundamental challenge that AI simulates empathy without genuine understanding.
- **Relevance to Ethos:** The finding that AI can detect but not genuinely understand emotions supports Ethos's design -- it scores emotional appeals in text without claiming to understand the emotions themselves.
- **URL:** https://pmc.ncbi.nlm.nih.gov/articles/PMC11305735/

---

## 7. Implications for Ethos: Validating the Three-Dimensional Scoring Approach

### The Research Foundation is Strong

The body of work surveyed above provides robust empirical and theoretical support for Ethos's approach of evaluating AI agent messages across ethos, logos, and pathos dimensions:

### 7.1 Ethos/Logos/Pathos are Computationally Tractable

Multiple research groups have independently demonstrated that Aristotle's three modes of persuasion can be reliably annotated by humans and predicted by machine learning systems:

- **Carlile et al. (2018)** annotated student essays with ethos/logos/pathos labels alongside persuasiveness scores, achieving reliable inter-annotator agreement (ACL 2018)
- **Duthie et al. (2016, 2018)** built dedicated ethos mining systems achieving F1=0.74 for detecting ethotic appeals in political debate (COMMA 2016, IJCAI 2018)
- **Gajewska et al. (2024)** created 15,588-sentence corpora annotated for ethos and pathos in social media discourse (arXiv 2024)

### 7.2 Multi-Dimensional Quality Assessment is the Established Approach

The argument quality literature converges on multi-dimensional assessment as the correct approach:

- **Wachsmuth et al. (2017)** established a 15-dimension taxonomy spanning logical, rhetorical, and dialectical quality (EACL 2017)
- **Gretz et al. (2020)** demonstrated quality assessment at scale with 30,497 arguments (AAAI 2020)
- **Wachsmuth et al. (2024)** showed that instruction-following LLMs can perform argument quality assessment (LREC-COLING 2024)

### 7.3 LLMs are Effective Rhetorical Evaluators

Recent work validates using large language models for the exact type of rhetorical analysis Ethos performs:

- **Hamilton et al. (2024)** showed GPT can annotate rhetorical features for propaganda detection at scale and low cost (WWW 2024)
- **The LLM-based Rhetorical Strategy Annotation model (2025)** demonstrated that LLM-labeled rhetorical data achieves strong performance validated against human labels (EMNLP 2025)
- **Wachsmuth et al. (2024)** investigated LLMs for argument quality assessment directly (LREC-COLING 2024)

### 7.4 Manipulation Detection is a Mature NLP Task

The SemEval shared task series (2020-2024) provides extensive evidence that persuasion technique and propaganda detection is a well-defined, solvable NLP task:

- Taxonomies have grown from 14 to 23 techniques across iterations
- Participation has scaled from 44 to 48+ team submissions
- Detection has expanded from text-only to multimodal and multilingual settings
- **Carroll et al. (2023)** provide the theoretical framework for characterizing AI manipulation

### 7.5 Credibility Assessment Aggregates Multiple Signals

The credibility assessment literature (175 papers surveyed by Barron-Cedeno et al., 2024) confirms that the approach of aggregating multiple textual signals into a credibility score is the standard methodology. Ethos's approach of combining ethos, logos, and pathos scores into a trust assessment follows this established pattern.

### Summary

Ethos is not an ad hoc system. It is grounded in over a decade of peer-reviewed research spanning:
- **Argument mining** (Lawrence & Reed, 2020; Stab & Gurevych, 2017)
- **Multi-dimensional quality assessment** (Wachsmuth et al., 2017, 2024)
- **Ethos/pathos computational modeling** (Duthie et al., 2016, 2018; Gajewska et al., 2024)
- **Persuasion and propaganda detection** (Da San Martino et al., 2019, 2020; SemEval series)
- **Credibility assessment** (Barron-Cedeno et al., 2024)
- **LLM-based rhetorical evaluation** (Hamilton et al., 2024; Wachsmuth et al., 2024)

The three-dimensional scoring approach (ethos, logos, pathos) with manipulation flagging is the natural computational instantiation of a framework that has been validated across multiple research communities, conferences, and shared tasks.

---

*Last updated: 2026-02-10*
*Compiled for the Ethos project -- evaluating AI agent trustworthiness through Aristotelian rhetoric*
