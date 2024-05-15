const tokens = ['if']
const branchers = ['{', '}']
const brackets = ['(', ')']

//
// 0: function call
// 1: ifs
// 2: ifs and else

function is_token(s) {
    return tokens.includes(s)
}

function is_token_prefix(s) { //maybe not the correct def of prefix
    if (is_token(s)) {
        return false
    }
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].startsWith(s)) {
            return true
        }
    }
    return false
}

function get_arguments(s, i) {
    if (s[i] !== brackets[0]) {
        console.log(s[i])
        throw new Error('Expected (')
    }
    let arguments = ''
    let next_char = s[i + 1]
    i += 1
    while (next_char !== brackets[1]) {
        arguments += s[i]
        i++
        next_char = s[i]
    }
    return {args: arguments, index: i + 1}
}

function get_branch(s, i) {
    var branch = ''
    var open_brackets = 0
    while (open_brackets >= 0) {
        if (i > s.length) {
            throw new Error('Expected }')
        }
        branch += s[i]
        i++
        if (s[i] === branchers[0]) {
            open_brackets++
        }
        else if (s[i] === branchers[1]) {
            open_brackets--
        }
    }
    return {content: branch, index: i + 1}
}

function lex_front(s) {
    let without_spaces = s.replace(/\s/g, '')  
    let without_spaces_and_semicolons = without_spaces.replace(/;/g, '')
    return lex_back(without_spaces_and_semicolons)
}

function lex_back(s) {
    console.log("Compiling: " + s)
    let i = 0
    let current_token = ''
    let tokens = []
    while (i < s.length) {
        while (is_token_prefix(current_token)) {
            current_token += s[i]
            i++
        }
        if (is_token(current_token)) {
            if (current_token === 'if') {
                var type = 1
                var branches = []
                var arguments = []

                var current_arguments = get_arguments(s, i)
                i = current_arguments.index
                
                console.log(current_arguments.args)

                if (s[i] !== branchers[0]) {
                    console.log(s[i])
                    throw new Error('Expected {')
                }
                i += 1
                var branch = get_branch(s, i)
                i = branch.index
                
                branches.push(lex_back(branch.content))
                arguments.push(current_arguments.args)

                while (s.substring(i, i + 6) === 'elseif') {
                    i += 6
                    var current_arguments = get_arguments(s, i)
                    i = current_arguments.index
                    if (s[i] !== branchers[0]) {
                        throw new Error('Expected {')
                    }
                    i += 1
                    var branch = get_branch(s, i)
                    i = branch.index
                    
                    branches.push(lex_back(branch.content))
                    arguments.push(current_arguments.args)
                }
                if (s.substring(i, i + 4) === 'else') {
                    type = 2
                    i += 4
                    i += 1
                    var branch = get_branch(s, i)
                    i = branch.index
                    
                    branches.push(lex_back(branch.content))
                }

                tokens.push({
                    type: type,
                    name: current_token,
                    arguments: arguments,
                    branches: branches
                })
            }
        }
        else {
            while (s[i] != brackets[0]) {
                if (i > s.length) {
                    throw new Error('Expected (')
                }
                current_token += s[i]
                i++
            }
            var current_arguments = get_arguments(s, i)
            i = current_arguments.index
            tokens.push({
                type: 0,
                name: current_token,
                arguments: [current_arguments.args],
                branches: []
            })
        }
        current_token = ''
    }
    return tokens
}