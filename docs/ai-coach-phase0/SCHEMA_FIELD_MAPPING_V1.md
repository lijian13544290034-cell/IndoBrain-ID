# WorkBuddy B Case Schema Mapping V1

All 100 source records and their `case_id` values are preserved byte-for-byte in the original corpus. Normalization creates a derivative; it never edits the source.

| Original field | Normalized field | Rule |
| --- | --- | --- |
| `case_id` | `caseId` | Exact copy; unique and immutable |
| source file + array index | `sourceLocator` | JSON Pointer-style locator |
| `learning_direction` | `direction` | Exact enum copy |
| `learner_level`, `learner_behavior`, `input_mode` | `preconditions[]` | Lossless key/value entries |
| `scenario`, `student_input`, `input_mode` | `input` | Exact text/mode copy |
| `expected_teacher_action` | `expected.teacherAction` | Exact copy |
| `forbidden_teacher_action` | `expected.forbiddenTeacherAction` | Exact copy |
| `success_criteria` | `expected.successCriteria` | Exact copy |
| `assertions` | `expected.assertions` | Full objects preserved |
| `target_content` | `targetContent` | Full object preserved |
| `curriculum_ref` | `references.original` | Exact copy |
| exact validation | `references.courseValidation` | Derived; no substring acceptance |
| `goal`, severity and remaining metadata | `originalMetadata` | Lossless copy |

Derived `category`, `skillIds`, `evaluationMode` and review fields are explicitly provisional. They do not rewrite source intent and remain human-reviewable.
