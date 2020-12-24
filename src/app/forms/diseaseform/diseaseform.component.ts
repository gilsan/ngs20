import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-diseaseform',
  templateUrl: './diseaseform.component.html',
  styleUrls: ['./diseaseform.component.scss']
})
export class DiseaseformComponent implements OnInit {

  resultStatus = 'detected';

  methods = 'Total genomic DNA was extracted from the each sample. Template and automated libraries were prepared on the Ion Chef System(Thermo Fisher Scientific) and subsequently sequenced on the Ion S5 system (Thermo Fisher Scientific) with the Ion 530 Chip kit. Alignment of sequences to the reference human genome (GRCh37/hg19) and base calling were performed using the Torrent Suite software version 5.8.0 (Thermo Fisher Scientific). The Torrent Variant Caller v5.8.0.19 (Thermo Fisher Scientific) was used for calling variants from mapped reads and the called variants were annotated by the Ion Reporter software v5.6. ';

  general = 'The analysis was optimised to identify base pair substitutions with a high sensitivity. The sensitivity for small insertions and deletions was lower. Deep-intronic mutations, mutations in the promoter region, repeats, large exonic deletions and duplications, and other structural variants were not detected by this test. Evaluation of germline mutation can be performed using buccal swab speciman.';

  constructor() { }

  ngOnInit(): void {
  }

  result(event) {
    this.resultStatus = event.srcElement.defaultValue;
    console.log('[checkbox status]', this.resultStatus);
  }

}
