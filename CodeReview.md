### Name of student that you code reviewed.
- Name: Jieyu Bu
- GitHub ID: codeeverydayyu


### Things that you noticed
- Did the variable names make sense?
    - Not fully, currently a few variable names such as factor1/factor2 are in use which do make sense but could become confusing.

- Is the code functional?
    - Currently code is not fully functional as it throws errors in most cells but it is still in progress so this is to be expected.
    - The lack of a username error handling also appears to be implemented in an unusual way that may be incorrect as it triggers once on page launch or when cleared rather than upon attempted interaction with buttons or cells.
    - There also is a error in parseFactor that throws a Maximum call stack size exceeded message to result if we use parentheses but this may just be due to implementation still being a work in progress
    - Parse term and parse factor are also encapsulated within parseExpression which may be a bug or a design decision, it is difficult to say at this point in time. If a design decision I am unsure if it fully meets Functional programming norms or if it is unusual. 


- Are the comments readable?
    - For the most part comments have not currently been added in  as it is still a work in progress
    - We are missing comments or docstrings on which characters different methods handle as well as ones explaining certain choices such as the use of regexes in parseFactor. 

- Are the function names self-explanatory?
    - Yes, assuming users are familiar with the concept of a recursive descent parser. More descriptive names could be used but chosen names are perfectly appropriate. 


### Name of student that you code reviewed.
- Name: Zhongyu Wei
- GitHub ID: Jerry086


### Things that you noticed
- Did the variable names make sense?
    - Yes, variable names are largely unchanged from the ones provided by the instructor. 

- Is the code functional?
    - Yes, code functions well apart from errors inherent in the source code that are out of scope. For reference ones currently unpatched include differences in how C and AC behave as well as the login message warning only triggering when we click cells and not when we click buttons - but this may be appropriate as there is a lack of clarity on whether the login message should apply in the instructions. 

- Are the comments readable?
    - Comments are readable but could be better as some docstrings are overly short and unexplanitory. They will still make sense if one is familiar with recursive descent parsers but could be more informative about how the method behaves. 

- Are the function names self-explanatory?
    - Yes, assuming users are familiar with the concept of a recursive descent parser. More descriptive names could be used but chosen names are perfectly appropriate. 

