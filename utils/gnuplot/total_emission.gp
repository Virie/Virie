#!/usr/bin/gnuplot -p
#
#
#
# ./emission_reports --output=data.txt --export_total
#


set terminal svg enhanced background rgb "white"
set output "total_emission.svg"

datafile = "data.txt"

set title "Coins at Given Time, Projected"
set xlabel "Days"
set ylabel "VRE"
set xtics out
set ytics out
set tics front
set key left
set key box vertical

set border 3
set xtics nomirror
set ytics nomirror

set xtics 365
set ytics 10000000.0
#set grid xtics ytics
set grid ytics

plot \
    datafile using 1:(column(4)+column(3)+column(2)) title "PoW emission" with filledcurves x1, \
    datafile using 1:(column(3)+column(2)) title "PoS emission" with filledcurves x1, \
    datafile using 1:(column(2)) title "Genesis block" with filledcurves x1



