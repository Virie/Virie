#!/usr/bin/gnuplot -p
#
#
#
# ./emission_reports --output data_by_year.txt --export_by_trop_year --count_years=12
#

set terminal svg enhanced background rgb "white"
set output "emission_by_year.svg"

datafile = "data_by_year.txt"

set title "Coins per Tropical Year, Projected"
set xlabel "Years"
set ylabel "VRE"
set xtics out
set ytics out
set tics front

set border 3
set xtics nomirror
set ytics nomirror

#set style data histogram
set boxwidth 0.5 absolute
set style fill solid 1.00 border lt -1
set key box

set xtics 1
set ytics 2000000.0
#set grid xtics ytics
set grid ytics

plot [0:12]\
    datafile using 1:(column(3)+column(2)) title "PoW emission" with boxes, \
    datafile using 1:(column(2)) title "PoS emission" with boxes



