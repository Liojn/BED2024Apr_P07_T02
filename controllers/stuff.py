
class GameState:
    def __init__(self, board_size):
        self.board_size = board_size
        self.board = [[' ' for _ in range(board_size)] for _ in range(board_size)]
        self.row_offset = 0

    def print_board(self):
        terminal_height = os.get_terminal_size().lines - 1  # Get terminal height, leaving one line for input

        while True:
            os.system('cls' if os.name == 'nt' else 'clear')  # Clear screen
            self.print_chunk(self.row_offset, terminal_height)  # Print chunk of the board

            action = input("Press Enter to scroll down, Q + Enter to quit: ").lower()
            if action == 'q':
                break
            elif action == '':
                self.row_offset += terminal_height
                if self.row_offset >= self.board_size:
                    self.row_offset = 0

    def print_chunk(self, start_row, num_rows):
        end_row = min(start_row + num_rows, self.board_size)

        column_headers = '  '.join(f'{i + 1:^{2}}' for i in range(self.board_size))
        print('     ' + column_headers)
        print('   +' + '---+' * self.board_size)

        for idx in range(start_row, end_row):
            row_letter = chr(ord('A') + idx)
            print(f'{row_letter:2} |' + '|'.join(f' {cell} ' for cell in self.board[idx]) + '|')
            print('   +' + '---+' * self.board_size)

# Example usage
def main():
    board_size = 30
    game_state = GameState(board_size)
#    game_state.print_board()

if __name__ == "__main__":
    main()

import curses

def main(stdscr):
    # Disable cursor blinking
    curses.curs_set(0)
    
    # Long message to display
    long_message = "This is a long message that will horizontally scroll when printed in the terminal."
    
    # Window setup
    stdscr.clear()
    stdscr.refresh()
    height, width = stdscr.getmaxyx()
    
    # Calculate the width needed for horizontal scrolling
    message_length = len(long_message)
    max_width = width - 2  # Leave some margin
    
    # Display the message with horizontal scrolling
    for i in range(message_length):
        stdscr.addstr(0, 0, long_message[i:i+max_width])
        stdscr.refresh()
        stdscr.clear()
        curses.napms(100)  # Adjust scrolling speed (milliseconds)

    stdscr.getch()

curses.wrapper(main)


